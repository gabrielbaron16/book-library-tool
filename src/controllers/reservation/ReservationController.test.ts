import "reflect-metadata";
import { container } from "../../config/container";
import request from "supertest";
import { IReservationService } from "../../application/services/reservation/IReservationService";
import { ControlledError } from "../../domain/errors/ControlledError";
import {ErrorResponseDTO} from "../dto/Error";
import {ReservationDTO} from "../dto/ReservationDTO";

jest.mock("../../application/services/Reservation/IReservationService");

let mockReservationService: jest.Mocked<IReservationService>;
let app: any;

beforeAll(async () => {
    jest.doMock("../../application/services/Reservation/IReservationService", () => {
        return {
            createReservation: jest.fn(),
        };
    });

    mockReservationService = require("../../application/services/Reservation/IReservationService");

    container.registerInstance<IReservationService>("IReservationService", mockReservationService);

    const { app: importedApp } = await import("../../index");
    app = importedApp;
});

afterEach(() => {
    jest.resetAllMocks();
    container.reset();
});

describe("POST /reservations", () => {
    it("should create a Reservation and return 201", async () => {
        mockReservationService.createReservation.mockResolvedValue(undefined);

        const newReservation: ReservationDTO = {
            bookId: "5354649KF",
            userEmail: "ibrahim@gmail.com",
            bookCount: 1,
            returnDate: new Date()
        };

        const response = await request(app).post("/Reservations").send(newReservation);

        expect(response.status).toBe(201);
    });

    it("should return 400 if there are a controller error", async () => {
        mockReservationService.createReservation.mockRejectedValue(
            new ControlledError("User with email ibrahim@gmail.com has insufficient balance.")
        );

        const newReservation: ReservationDTO = {
            bookId: "5354649KF",
            userEmail: "ibrahim@gmail.com",
            bookCount: 1,
            returnDate: new Date()
        };
        const response = await request(app).post("/reservations").send(newReservation);

        const errorResponse: ErrorResponseDTO = {
            message: `User with email ${newReservation.userEmail} has insufficient balance.`
        };
        expect(response.status).toBe(400);
        expect(response.body).toEqual(errorResponse);
    });

    it("should return 500 if there are an unexpected error creating the reservation", async () => {
        mockReservationService.createReservation.mockRejectedValue(
            new Error("Database connection error")
        );

        const newReservation: ReservationDTO = {
            bookId: "5354649KF",
            userEmail: "ibrahim@gmail.com",
            bookCount: 1,
            returnDate: new Date()
        };

        const response = await request(app).post("/reservations").send(newReservation);

        const errorResponse: ErrorResponseDTO = {
            message: `Unexpected error adding a new reservation`
        };
        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse);
    });
});