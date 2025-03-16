import { Reservation } from "../../../domain/entities/Reservation";

export interface IReservationService {
    createReservation(reservation: Reservation): Promise<void>;
    getReservationsByBookId(bookId: string, page: number, limit: number): Promise<{ reservations: Reservation[], totalRecords: number }>;
}