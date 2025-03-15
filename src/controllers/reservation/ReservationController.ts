import { Request, Response } from "express";
import { container } from "../../config/container";
import { IReservationService } from "../../application/services/reservation/IReservationService";
import { ReservationDTO } from "../dto/ReservationDTO";
import { mapReservationDtoToReservation } from "../../domain/mappers/ReservationMappers";
import { ErrorResponseDTO } from "../dto/Error";
import { ControlledError } from "../../domain/errors/ControlledError";

const ReservationService = container.resolve<IReservationService>("IReservationService");

export const addReservation = async (req: Request, res: Response) => {
    try {
        const ReservationDTO: ReservationDTO = req.body;
        const newReservation = mapReservationDtoToReservation(ReservationDTO);
        await ReservationService.createReservation(newReservation);
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
                message: "Unexpected error adding a new Reservation"
            };
            res.status(500).send(errorResponse);
        }
    }
};
