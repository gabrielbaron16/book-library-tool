import { Reservation } from "../../../domain/entities/Reservation";

export interface IReservationService {
    createReservation(reservation: Reservation): Promise<void>;
}