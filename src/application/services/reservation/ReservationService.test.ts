import "reflect-metadata";
import {ReservationService} from "./ReservationService";
import {IBookRepository} from "../../../domain/repositories/IBookRepository";
import {IReservationRepository} from "../../../domain/repositories/IReservationRepository";
import {IUserRepository} from "../../../domain/repositories/IUserRepository";
import {Reservation} from "../../../domain/entities/Reservation";
import {ControlledError} from "../../../domain/errors/ControlledError";
import {container} from "tsyringe";

jest.mock("../../../domain/repositories/IBookRepository");
jest.mock("../../../domain/repositories/IReservationRepository");
jest.mock("../../../domain/repositories/IUserRepository");

let reservationService: ReservationService;
let mockBookRepository: jest.Mocked<IBookRepository>;
let mockReservationRepository: jest.Mocked<IReservationRepository>;
let mockUserRepository: jest.Mocked<IUserRepository>;

beforeEach(() => {
    jest.doMock("../../../domain/repositories/IBookRepository", () => {
        return {
            findById: jest.fn(),
        };
    });
    jest.doMock("../../../domain/repositories/IUserRepository", () => {
        return {
            exists: jest.fn(),
            getBalance: jest.fn(),
            updateBalance: jest.fn(),
        };
    });
    jest.doMock("../../../domain/repositories/IReservationRepository", () => {
        return {
            findByBookId: jest.fn(),

        };
    });

    mockBookRepository = require("../../../domain/repositories/IBookRepository")
    mockUserRepository = require("../../../domain/repositories/IUserRepository");
    mockReservationRepository = require("../../../domain/repositories/IReservationRepository");

    container.registerInstance<IBookRepository>("IBookRepository", mockBookRepository);
    container.registerInstance<IReservationRepository>("IReservationRepository", mockReservationRepository);
    container.registerInstance<IUserRepository>("IUserRepository", mockUserRepository);

    reservationService = container.resolve(ReservationService);

});

afterEach(() => {
    jest.resetAllMocks();
    container.reset();
});

describe("createReservation Service", () => {
    it("should create a reservation successfully", async () => {
        const reservation: Reservation = {
            bookId: "3425345HCG",
            userEmail: "peterrusso@gmail.com",
            bookCount: 1,
            returnDate: new Date(),
            reservationDate: new Date(),
            isReturned: false
        };

        mockBookRepository.findById.mockResolvedValue({bookId: "3425345HCG", stock: 10} as any);
        mockUserRepository.exists.mockResolvedValue(true);
        mockUserRepository.getBalance.mockResolvedValue(10);
        mockReservationRepository.save.mockResolvedValue(true);
        mockUserRepository.updateBalance.mockResolvedValue(true);

        await reservationService.createReservation(reservation);

        expect(mockBookRepository.findById).toHaveBeenCalledWith("3425345HCG");
        expect(mockUserRepository.exists).toHaveBeenCalledWith("peterrusso@gmail.com");
        expect(mockUserRepository.getBalance).toHaveBeenCalledWith("peterrusso@gmail.com");
        expect(mockReservationRepository.save).toHaveBeenCalledWith(reservation);
        expect(mockUserRepository.updateBalance).toHaveBeenCalledWith("peterrusso@gmail.com", 7);
    });

    it("should throw an error if the book is not found", async () => {
        const reservation: Reservation = {
            bookId: "3425345HCG",
            userEmail: "peterrusso@gmail.com",
            bookCount: 1,
            returnDate: new Date(),
            reservationDate: new Date(),
            isReturned: false
        };
        mockBookRepository.findById.mockResolvedValue(null);

        await expect(reservationService.createReservation(reservation)).rejects.toThrow(
            new ControlledError("Book with ID 3425345HCG not found.")
        );
    });

    it("should throw an error if the book is out of stock", async () => {
        const reservation: Reservation = {
            bookId: "3425345HCG",
            userEmail: "peterrusso@gmail.com",
            bookCount: 1,
            returnDate: new Date(),
            reservationDate: new Date(),
            isReturned: false
        };

        mockBookRepository.findById.mockResolvedValue({bookId: "3425345HCG", stock: 0} as any);

        await expect(reservationService.createReservation(reservation)).rejects.toThrow(
            new ControlledError("Book with ID 3425345HCG out of stock.")
        );
    });

    it("should throw an error if the user is not found", async () => {
        const reservation: Reservation = {
            bookId: "3425345HCG",
            userEmail: "peterrusso@gmail.com",
            bookCount: 1,
            returnDate: new Date(),
            reservationDate: new Date(),
            isReturned: false
        };

        mockBookRepository.findById.mockResolvedValue({bookId: "3425345HCG", stock: 10} as any);
        mockUserRepository.exists.mockResolvedValue(false);

        await expect(reservationService.createReservation(reservation)).rejects.toThrow(
            new ControlledError("User with email peterrusso@gmail.com not found.")
        );
    });

    it("should throw an error if the user has insufficient balance", async () => {
        const reservation: Reservation = {
            bookId: "3425345HCG",
            userEmail: "peterrusso@gmail.com",
            bookCount: 1,
            returnDate: new Date(),
            reservationDate: new Date(),
            isReturned: false
        };

        mockBookRepository.findById.mockResolvedValue({bookId: "3425345HCG", stock: 10} as any);
        mockUserRepository.exists.mockResolvedValue(true);
        mockUserRepository.getBalance.mockResolvedValue(2);

        await expect(reservationService.createReservation(reservation)).rejects.toThrow(
            new ControlledError("User with email peterrusso@gmail.com has insufficient balance.")
        );
    });
});

describe("getReservationsByBookId Service", () => {
    it("should return reservations and total records for a valid bookId", async () => {
        const reservations: Reservation[] = [
            { bookId: "214235l12", userEmail: "bernal@gmail.com", bookCount: 1, returnDate: new Date(), reservationDate: new Date(), isReturned: false },
        ];
        mockReservationRepository.findByBookId.mockResolvedValue({ reservations, totalRecords: 1 });

        const result = await reservationService.getReservationsByBookId("214235l12", 1, 10);

        expect(result).toEqual({ reservations, totalRecords: 1 });
        expect(mockReservationRepository.findByBookId).toHaveBeenCalledWith("214235l12", 0, 10);
    });

    it("should return an empty array and zero total records if no reservations are found", async () => {
        mockReservationRepository.findByBookId.mockResolvedValue({ reservations: [], totalRecords: 0 });

        const result = await reservationService.getReservationsByBookId("214235l12", 1, 10);

        expect(result).toEqual({ reservations: [], totalRecords: 0 });
        expect(mockReservationRepository.findByBookId).toHaveBeenCalledWith("214235l12", 0, 10);
    });
});