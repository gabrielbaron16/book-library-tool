import {Reservation} from "../entities/Reservation";

export interface IReservationRepository {
    findById(reservationId: string): Promise<Reservation | null>;

    save(reservation: Reservation): Promise<boolean>;

    findActiveByBookId(bookId: string): Promise<Reservation[]>;

    findByBookId(bookId: string, offset: number, limit: number): Promise<{
        reservations: Reservation[],
        totalRecords: number
    }>;

    findDueReservations(startDate?: Date, endDate?: Date): Promise<Reservation[]>;

    finishReservation(reservation: Reservation, realReturnDate: Date): Promise<void>;

    buyReservation(reservationId: string): Promise<void>;
}