import { Reservation } from "../entities/Reservation";

export interface IReservationRepository {
    save(reservation: Reservation): Promise<boolean>;
    findActiveByBookId(bookId: string): Promise<Reservation[]>;
    findByBookId(bookId: string, offset: number, limit: number): Promise<{ reservations: Reservation[], totalRecords: number }>;
    findDueReservations(dueSoonDate: Date): Promise<Reservation[]>;
}