import { Reservation } from "../entities/Reservation";
import { ReservationDTO } from "../../presentation/controllers/dto/ReservationDTO";

export const mapReservationDtoToReservation = (reservationDto: ReservationDTO): Reservation =>
    new Reservation(
        reservationDto.userEmail,
        reservationDto.bookId,
        reservationDto.bookCount,
        reservationDto.returnDate,
        new Date(),
        false,
        false
    );

export const mapReservationToReservationDto = (reservation: Reservation): ReservationDTO =>
    new ReservationDTO(
        reservation.userEmail,
        reservation.bookId,
        reservation.bookCount,
        reservation.returnDate,
        reservation.reservationDate,
        reservation.isReturned,
        reservation.isBought,
        reservation.id,
        reservation.realReturnDate
    );