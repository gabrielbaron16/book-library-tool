import { Request, Response } from "express";
import { container } from "../../../config/container";
import { IUserService } from "../../../application/services/user/IUserService";
import { UserDTO } from "../dto/UserDTO";
import { mapUserDtoToUser } from "../../../domain/mappers/UserMappers";
import { ErrorResponseDTO } from "../dto/Error";
import { ControlledError } from "../../../domain/errors/ControlledError";
import logger from "../../../config/logger";

const userService = container.resolve<IUserService>("IUserService");

export const addUser = async (req: Request, res: Response) => {
    try {
        const userDTO: UserDTO = req.body;
        const newUser = mapUserDtoToUser(userDTO);
        await userService.createUser(newUser);
        res.status(201).end();
    } catch (e) {
        let errorResponse: ErrorResponseDTO;
        if (e instanceof ControlledError) {
            errorResponse = {
                message: e.message
            };
            res.status(400).send(errorResponse);
        } else {
            logger.error("Unexpected error adding a new user", e);
            errorResponse = {
                message: "Unexpected error adding a new user"
            };
            res.status(500).send(errorResponse);
        }
    }
};

export const updateUserBalance = async (req: Request, res: Response) => {
    const { email } = req.params;
    const { balance } = req.body;
    try {
        const updated = await userService.updateBalance(email, balance);
        if (!updated) {
            const errorResponse: ErrorResponseDTO = {
                message: "User not found"
            };
            res.status(404).send(errorResponse);
            return;
        }
        res.status(204).end();
    } catch (e) {
        logger.error("Unexpected error updating user balance", e);
        const errorResponse: ErrorResponseDTO = {
            message: "Unexpected error updating user balance"
        };
        res.status(500).send(errorResponse);
    }
}