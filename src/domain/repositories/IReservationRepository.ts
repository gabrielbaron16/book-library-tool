import { Reservation } from "../entities/Reservation";

export interface IReservationRepository {
    save(reservation: Reservation): Promise<boolean>;
    findByBookId(bookId: string, offset: number, limit: number): Promise<{ reservations: Reservation[], totalRecords: number }>;
    findDueReservations(dueSoonDate: Date): Promise<Reservation[]>;
}