import {Request, Response} from "express";
import {container} from "../../config/container";
import {IReservationService} from "../../application/services/reservation/IReservationService";
import {ReservationDTO} from "../dto/ReservationDTO";
import {mapReservationDtoToReservation, mapReservationToReservationDto} from "../../domain/mappers/ReservationMappers";
import {ErrorResponseDTO} from "../dto/Error";
import {ControlledError} from "../../domain/errors/ControlledError";

const reservationService = container.resolve<IReservationService>("IReservationService");

export const addReservation = async (req: Request, res: Response) => {
    try {
        const ReservationDTO: ReservationDTO = req.body;
        const newReservation = mapReservationDtoToReservation(ReservationDTO);
        const returnDateTime = new Date(newReservation.returnDate);
        const now = new Date();
        if (returnDateTime < now) {
            const errorResponse: ErrorResponseDTO = {
                message: "returnDate must be later that today"
            };
            res.status(400).send(errorResponse);
            return;
        }
        await reservationService.createReservation(newReservation);
        res.status(201).end();
    } catch (e) {
        let errorResponse: ErrorResponseDTO;
        if (e instanceof ControlledError) {
            errorResponse = {
                message: e.message
            };
            res.status(400).send(errorResponse);
        } else {
            errorResponse = {
                message: "Unexpected error adding a new reservation"
            };
            res.status(500).send(errorResponse);
        }
    }
};

export const getReservationsByBookId = async (req: Request, res: Response) => {
    try {
        const {bookId} = req.params;
        const {page, limit} = req.query;

        const {
            reservations,
            totalRecords
        } = await reservationService.getReservationsByBookId(bookId, parseInt(page as string, 10),
            parseInt(limit as string, 10));
        if (!reservations || reservations.length === 0) {
            const errorResponse: ErrorResponseDTO = {
                message: "No reservations found"
            };
            res.status(404).send(errorResponse);
            return;
        }

        const reservationResponse = reservations.map(reservation => mapReservationToReservationDto(reservation));
        res.status(200).send({reservations: reservationResponse, totalRecords});
    } catch (e) {
        const errorResponse: ErrorResponseDTO = {
            message: "Unexpected error fetching reservations"
        };
        res.status(500).send(errorResponse);
    }
}
