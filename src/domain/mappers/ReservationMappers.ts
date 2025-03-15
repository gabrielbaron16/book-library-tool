import { Reservation } from "../entities/Reservation";
import { ReservationDTO } from "../../controllers/dto/ReservationDTO";

export const mapReservationDtoToReservation = (reservationDto: ReservationDTO): Reservation =>
    new Reservation(
        reservationDto.userEmail,
        reservationDto.bookId,
        reservationDto.bookCount,
        reservationDto.returnDate,
        new Date(),
        false
    );