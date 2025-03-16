import {inject, injectable} from "tsyringe";
import {IReservationService} from "./IReservationService";
import {IBookRepository} from "../../../domain/repositories/IBookRepository";
import {IReservationRepository} from "../../../domain/repositories/IReservationRepository";
import {IUserRepository} from "../../../domain/repositories/IUserRepository";
import {Reservation} from "../../../domain/entities/Reservation";
import {ControlledError} from "../../../domain/errors/ControlledError";

const RESERVATION_COST = 3;

@injectable()
export class ReservationService implements IReservationService {
    constructor(
        @inject("IReservationRepository") private reservationRepository: IReservationRepository,
        @inject("IBookRepository") private bookRepository: IBookRepository,
        @inject("IUserRepository") private userRepository: IUserRepository
    ) {}

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

    async getReservationsByBookId(bookId: string, page: number, limit: number): Promise<{ reservations: Reservation[], totalRecords: number }> {
        const offset = (page - 1) * limit;
        return this.reservationRepository.findByBookId(bookId, offset, limit);
    }
}