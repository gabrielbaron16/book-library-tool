import "reflect-metadata";
import { container } from "../../../config/container";
import request from "supertest";
import { IReservationService } from "../../../application/services/reservation/IReservationService";
import { ControlledError } from "../../../domain/errors/ControlledError";
import {ErrorResponseDTO} from "../dto/Error";
import {ReservationDTO} from "../dto/ReservationDTO";
import {Reservation} from "../../../domain/entities/Reservation";

jest.mock("../../../application/services/reservation/IReservationService");

let mockReservationService: jest.Mocked<IReservationService>;
let app: any;

beforeAll(async () => {
    jest.doMock("../../../application/services/reservation/IReservationService", () => {
        return {
            createReservation: jest.fn(),
            getReservationsByBookId: jest.fn(),
            finishReservation: jest.fn(),
        };
    });

    mockReservationService = require("../../../application/services/reservation/IReservationService");

    container.registerInstance<IReservationService>("IReservationService", mockReservationService);

    const { app: importedApp } = await import("../../../index");
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
            returnDate: new Date(new Date().setDate(new Date().getDate() + 10))
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
            returnDate: new Date(new Date().setDate(new Date().getDate() + 10))
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
            returnDate: new Date(new Date().setDate(new Date().getDate() + 10))
        };

        const response = await request(app).post("/reservations").send(newReservation);

        const errorResponse: ErrorResponseDTO = {
            message: `Unexpected error adding a new reservation`
        };
        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse);
    });

    it("should return 400 if the return date is before today", async () => {
        mockReservationService.createReservation.mockRejectedValue(
            new ControlledError("User with email ibrahim@gmail.com has insufficient balance.")
        );

        const newReservation: ReservationDTO = {
            bookId: "5354649KF",
            userEmail: "ibrahim@gmail.com",
            bookCount: 1,
            returnDate: new Date(new Date().setDate(new Date().getDate() - 2))
        };
        const response = await request(app).post("/reservations").send(newReservation);

        const errorResponse: ErrorResponseDTO = {
            message: `returnDate must be later that today`
        };
        expect(response.status).toBe(400);
        expect(response.body).toEqual(errorResponse);
    });
});

describe("GET /reservations/book/:bookId", () => {
    it("should return reservations and total records for a valid bookId", async () => {
        const reservations: Reservation[] = [
            { bookId: "1354534HGA", userEmail: "chrismoltisanti@gmail.com", bookCount: 1, returnDate: new Date(), reservationDate: new Date(), isReturned: true },
        ];
        mockReservationService.getReservationsByBookId.mockResolvedValue({ reservations, totalRecords: 1 });

        const response = await request(app).get("/reservations/book/1354534HGA?page=1&limit=10");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            reservations: reservations.map(reservation => ({
                bookId: reservation.bookId,
                userEmail: reservation.userEmail,
                bookCount: reservation.bookCount,
                returnDate: reservation.returnDate.toISOString(),
                reservationDate: reservation.reservationDate.toISOString(),
                isReturned: reservation.isReturned,
            })),
            totalRecords: 1,
        });
        expect(mockReservationService.getReservationsByBookId).toHaveBeenCalledWith("1354534HGA", 1, 10);
    });

    it("should return 404 if no reservations are found", async () => {
        mockReservationService.getReservationsByBookId.mockResolvedValue({ reservations: [], totalRecords: 0 });

        const response = await request(app).get("/reservations/book/1354534HGA?page=1&limit=10");

        const errorResponse: ErrorResponseDTO = {
            message: "No reservations found",
        };

        expect(response.status).toBe(404);
        expect(response.body).toEqual(errorResponse);
        expect(mockReservationService.getReservationsByBookId).toHaveBeenCalledWith("1354534HGA", 1, 10);
    });

    it("should return 500 if there is an unexpected error", async () => {
        mockReservationService.getReservationsByBookId.mockRejectedValue(new Error("Unexpected error"));

        const response = await request(app).get("/reservations/book/1354534HGA?page=1&limit=10");

        const errorResponse: ErrorResponseDTO = {
            message: "Unexpected error fetching reservations",
        };

        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse);
        expect(mockReservationService.getReservationsByBookId).toHaveBeenCalledWith("1354534HGA", 1, 10);
    });
});

describe("PATCH /reservations/finish/:id", () => {
    it("should return 200", async () => {
        mockReservationService.finishReservation.mockResolvedValue(true);

        const response = await request(app).patch("/reservations/finish/334534645-ER");

        expect(response.status).toBe(200);
        expect(mockReservationService.finishReservation).toHaveBeenCalledWith("334534645-ER");
    });

    it("should return 404 if reservation does not exists", async () => {
        mockReservationService.finishReservation.mockResolvedValue(false);

        const response = await request(app).patch("/reservations/finish/334534645-ER");

        expect(response.status).toBe(404);
        expect(mockReservationService.finishReservation).toHaveBeenCalledWith("334534645-ER");
    });
});