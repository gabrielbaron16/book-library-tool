import {inject, injectable} from "tsyringe";
import {IReservationService} from "./IReservationService";
import {IBookRepository} from "../../../domain/repositories/IBookRepository";
import {IReservationRepository} from "../../../domain/repositories/IReservationRepository";
import {IUserRepository} from "../../../domain/repositories/IUserRepository";
import {Reservation} from "../../../domain/entities/Reservation";
import {ControlledError} from "../../../domain/errors/ControlledError";
import {IEmailService} from "../../../domain/email/IEmailService";
import {DateUtils} from "../../../domain/utils/dateUtils";
import logger from "../../../config/logger";

const RESERVATION_COST = 3;
const DAYS_BEFORE_DUE_DATE = 2;
const DAYS_AFTER_DUE_DATE = 3
const CHUNK_SIZE = 10;
const LATE_FEE = 0.2;

@injectable()
export class ReservationService implements IReservationService {
    constructor(
        @inject("IReservationRepository") private reservationRepository: IReservationRepository,
        @inject("IBookRepository") private bookRepository: IBookRepository,
        @inject("IUserRepository") private userRepository: IUserRepository,
        @inject("IEmailService") private emailService: IEmailService
    ) {
    }

    async createReservation(reservation: Reservation): Promise<void> {
        const book = await this.bookRepository.findById(reservation.bookId);
        if (!book) {
            throw new ControlledError(`Book with ID ${reservation.bookId} not found.`);
        }
        if (book.stock - reservation.bookCount < 0) {
            throw new ControlledError(`Book with ID ${reservation.bookId} out of stock.`);
        }

        const userExists = await this.userRepository.exists(reservation.userEmail);
        if (!userExists) {
            throw new ControlledError(`User with email ${reservation.userEmail} not found.`);
        }

        const userBalance = await this.userRepository.getBalance(reservation.userEmail);
        if (!userBalance || userBalance < RESERVATION_COST) {
            throw new ControlledError(`User with email ${reservation.userEmail} has insufficient balance.`);
        }

        await this.reservationRepository.save(reservation);

        const newBalance = userBalance - RESERVATION_COST;
        await this.userRepository.updateBalance(reservation.userEmail, newBalance);
    }

    async getReservationsByBookId(bookId: string, page: number, limit: number): Promise<{
        reservations: Reservation[],
        totalRecords: number
    }> {
        const offset = (page - 1) * limit;
        return this.reservationRepository.findByBookId(bookId, offset, limit);
    }

    async notifyUpcomingDueDate(): Promise<void> {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + DAYS_BEFORE_DUE_DATE);

        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        const reservations = await this.reservationRepository.findDueReservations(startDate, endDate);

        for (let i = 0; i < reservations.length; i += CHUNK_SIZE) {
            const chunk = reservations.slice(i, i + CHUNK_SIZE);

            await Promise.all(chunk.map(async (reservation) => {
                try {
                    const book = await this.bookRepository.findById(reservation.bookId);
                    if (book) {
                        const subject = "Return Reminder";
                        const text = `Hi, remember to return the book ${book.title} to the library. 
                    Your due date is ${reservation.returnDate.toISOString()}.`;

                        return this.emailService.sendEmail(reservation.userEmail, subject, text);
                    }
                } catch (error) {
                    logger.error(`Error processing reservation ${reservation.bookId}:`, error);
                }
            }));
        }
    }

    async notifyLateReturns(): Promise<void> {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - DAYS_AFTER_DUE_DATE);

        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        const reservations = await this.reservationRepository.findDueReservations(startDate, endDate);

        for (let i = 0; i < reservations.length; i += CHUNK_SIZE) {
            const chunk = reservations.slice(i, i + CHUNK_SIZE);

            await Promise.all(chunk.map(async (reservation) => {
                try {
                    const book = await this.bookRepository.findById(reservation.bookId);
                    if (book) {
                        const subject = "Late Return Reminder";
                        const text = `Hi, remember to return the book ${book.title} to the library. 
                    Your due date was ${reservation.returnDate.toISOString()}.`;

                        return this.emailService.sendEmail(reservation.userEmail, subject, text);
                    }
                } catch (error) {
                    logger.error(`Error processing reservation ${reservation.bookId}:`, error);
                }
            }));
        }
    }

    async finishReservation(reservationId: string): Promise<boolean> {
        const reservation = await this.reservationRepository.findById(reservationId);
        if (!reservation){
            return false
        }
        if (reservation.isReturned){
            throw new ControlledError(`Reservation with ID ${reservationId} is already finished.`);
        }
        await this.reservationRepository.finishReservation(reservation, new Date());
        return true
    }

    async applyLateReturnCharge(): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 1);

        const reservations = await this.reservationRepository.findDueReservations(undefined, endDate);
        for (let i = 0; i < reservations.length; i += CHUNK_SIZE) {
            const chunk = reservations.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (reservation) => {
                try {
                    const result = await this.userRepository.incrementBalance(reservation.userEmail, -LATE_FEE);
                    if (result){
                        const book = await this.bookRepository.findById(reservation.bookId);
                        if (book){
                            const daysLate = DateUtils.getDaysDifference(reservation.returnDate);
                            const totalLateFee = daysLate * LATE_FEE * reservation.bookCount;
                            const bookPrice = book.price * reservation.bookCount;

                            if (totalLateFee >= bookPrice && reservation.id) {
                                logger.info(`Book ${reservation.bookId} has to be bought by ${reservation.userEmail}`);
                                await this.reservationRepository.buyReservation(reservation.id);
                            }
                        }
                    }
                } catch (error) {
                    logger.error(`Error processing reservation ${reservation.bookId}:`, error);
                }
            }));
        }
    }
}