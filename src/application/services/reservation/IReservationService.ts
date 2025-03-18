import {Reservation} from "../../../domain/entities/Reservation";

export interface IReservationService {
    createReservation(reservation: Reservation): Promise<void>;

    getReservationsByBookId(bookId: string, page: number, limit: number): Promise<{
        reservations: Reservation[],
        totalRecords: number
    }>;

    notifyUpcomingDueDate(): Promise<void>;

    notifyLateReturns(): Promise<void>;

    finishReservation(reservationId: string): Promise<boolean>;

    applyLateReturnCharge(): Promise<void>;
}