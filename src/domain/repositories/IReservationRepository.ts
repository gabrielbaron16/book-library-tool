import { Reservation } from "../entities/Reservation";

export interface IReservationRepository {
    save(reservation: Reservation): Promise<boolean>;
}