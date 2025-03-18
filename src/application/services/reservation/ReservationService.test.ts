import "reflect-metadata";
import {ReservationService} from "./ReservationService";
import {IBookRepository} from "../../../domain/repositories/IBookRepository";
import {IReservationRepository} from "../../../domain/repositories/IReservationRepository";
import {IUserRepository} from "../../../domain/repositories/IUserRepository";
import {Reservation} from "../../../domain/entities/Reservation";
import {ControlledError} from "../../../domain/errors/ControlledError";
import {container} from "tsyringe";
import {IEmailService} from "../../../domain/email/IEmailService";
import {Book} from "../../../domain/entities/Book";

jest.mock("../../../domain/repositories/IBookRepository");
jest.mock("../../../domain/repositories/IReservationRepository");
jest.mock("../../../domain/repositories/IUserRepository");

let reservationService: ReservationService;
let mockBookRepository: jest.Mocked<IBookRepository>;
let mockReservationRepository: jest.Mocked<IReservationRepository>;
let mockUserRepository: jest.Mocked<IUserRepository>;
let mockEmailService: jest.Mocked<IEmailService>

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
            incrementBalance: jest.fn(),
        };
    });
    jest.doMock("../../../domain/repositories/IReservationRepository", () => {
        return {
            save: jest.fn(),
            findByBookId: jest.fn(),
            findDueReservations: jest.fn(),
            findById: jest.fn(),
            finishReservation: jest.fn(),
        };
    });
    jest.doMock("../../../domain/email/IEmailService", () => {
        return {
            sendEmail: jest.fn(),
        };
    });

    mockBookRepository = require("../../../domain/repositories/IBookRepository")
    mockUserRepository = require("../../../domain/repositories/IUserRepository");
    mockReservationRepository = require("../../../domain/repositories/IReservationRepository");
    mockEmailService = require("../../../domain/email/IEmailService");

    container.registerInstance<IBookRepository>("IBookRepository", mockBookRepository);
    container.registerInstance<IReservationRepository>("IReservationRepository", mockReservationRepository);
    container.registerInstance<IUserRepository>("IUserRepository", mockUserRepository);
    container.registerInstance<IEmailService>("IEmailService", mockEmailService);

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
            isReturned: false,
            isBought: false
        };

        mockBookRepository.findById.mockResolvedValue({bookId: "3425345HCG", stock: 10} as Book);
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
            isReturned: false,
            isBought: false
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
            isReturned: false,
            isBought: false
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
            isReturned: false,
            isBought: false
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
            isReturned: false,
            isBought: false
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
            {
                id: "4534546yyut-hhk",
                bookId: "214235l12",
                userEmail: "bernal@gmail.com",
                bookCount: 1,
                returnDate: new Date(),
                reservationDate: new Date(),
                isReturned: false,
                isBought: false
            },
        ];
        mockReservationRepository.findByBookId.mockResolvedValue({reservations, totalRecords: 1});

        const result = await reservationService.getReservationsByBookId("214235l12", 1, 10);

        expect(result).toEqual({reservations, totalRecords: 1});
        expect(mockReservationRepository.findByBookId).toHaveBeenCalledWith("214235l12", 0, 10);
    });

    it("should return an empty array and zero total records if no reservations are found", async () => {
        mockReservationRepository.findByBookId.mockResolvedValue({reservations: [], totalRecords: 0});

        const result = await reservationService.getReservationsByBookId("214235l12", 1, 10);

        expect(result).toEqual({reservations: [], totalRecords: 0});
        expect(mockReservationRepository.findByBookId).toHaveBeenCalledWith("214235l12", 0, 10);
    });
});

describe("notifyUpcomingDueDate Service", () => {
    it("should send reminder emails for due reservations", async () => {
        const reservations: Reservation[] = [
            {
                id: "4534546yyut-hhk",
                bookId: "342352FT",
                userEmail: "carmsoprano@gmail.com",
                bookCount: 1,
                returnDate: new Date(),
                reservationDate: new Date(),
                isReturned: false,
                isBought: false
            },
            {
                id: "4534546yyut-hjk",
                bookId: "342352FT",
                userEmail: "medowsoprano@gmail.com",
                bookCount: 1,
                returnDate: new Date(),
                reservationDate: new Date(),
                isReturned: false,
                isBought: false
            }
        ];

        mockReservationRepository.findDueReservations.mockResolvedValue(reservations);
        mockBookRepository.findById.mockResolvedValue({bookId: "342352FT", title: "Don Quijote"} as Book);
        mockEmailService.sendEmail.mockResolvedValue(undefined);

        await reservationService.notifyUpcomingDueDate();

        expect(mockReservationRepository.findDueReservations).toHaveBeenCalled();
        expect(mockBookRepository.findById).toHaveBeenCalledTimes(reservations.length);
        expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(reservations.length);
        reservations.forEach(reservation => {
            expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
                reservation.userEmail,
                "Return Reminder",
                expect.stringContaining("Don Quijote")
            );
        });
    });

    it("should handle no due reservations", async () => {
        mockReservationRepository.findDueReservations.mockResolvedValue([]);

        await reservationService.notifyUpcomingDueDate();

        expect(mockReservationRepository.findDueReservations).toHaveBeenCalled();
        expect(mockBookRepository.findById).not.toHaveBeenCalled();
        expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
});

describe("finishReservation Service", () => {
    it("should finish a reservation successfully", async () => {
        const reservation: Reservation = {
            id: "1236456457-dgdf",
            bookId: "3425345HCG",
            userEmail: "peterrusso@gmail.com",
            bookCount: 1,
            returnDate: new Date(),
            reservationDate: new Date(),
            isReturned: false,
            isBought: false
        };

        mockReservationRepository.findById.mockResolvedValue(reservation);
        mockReservationRepository.finishReservation.mockResolvedValue();

        const result = await reservationService.finishReservation("1236456457-dgdf");

        expect(result).toBe(true);
        expect(mockReservationRepository.findById).toHaveBeenCalledWith("1236456457-dgdf");
        expect(mockReservationRepository.finishReservation).toHaveBeenCalledWith(reservation, expect.any(Date));
    });

    it("should return false if the reservation is not found", async () => {
        mockReservationRepository.findById.mockResolvedValue(null);

        const result = await reservationService.finishReservation("1236456457-dgdf");

        expect(result).toBe(false);

        expect(mockReservationRepository.findById).toHaveBeenCalledWith("1236456457-dgdf");
        expect(mockReservationRepository.finishReservation).not.toHaveBeenCalled();
    });

    it("should throw an error if the reservation is finished", async () => {
        const reservation: Reservation = {
            id: "1236456457-dgdf",
            bookId: "3425345HCG",
            userEmail: "peterrusso@gmail.com",
            bookCount: 1,
            returnDate: new Date(),
            reservationDate: new Date(),
            isReturned: true,
            isBought: false
        };

        mockReservationRepository.findById.mockResolvedValue(reservation);

        await expect(reservationService.finishReservation("1236456457-dgdf")).rejects.toThrow(
            new ControlledError("Reservation with ID 1236456457-dgdf is already finished.")
        );

        expect(mockReservationRepository.findById).toHaveBeenCalledWith("1236456457-dgdf");
        expect(mockReservationRepository.finishReservation).not.toHaveBeenCalled();
    });
});

describe("applyLateReturnCharge", () => {

    it("should apply late return fees to overdue reservations", async () => {
        const reservations: Reservation[] = [
            {
                id: "134534534-AGFGAF",
                bookId: "21432JK",
                userEmail: "bobsacamano@gmail.com.com",
                reservationDate: new Date("2024-03-01"),
                returnDate: new Date("2024-03-01"),
                bookCount: 1,
                isReturned: false,
                isBought: false
            },
            {
                id: "134534534-AGFGAA",
                bookId: "242342JI",
                userEmail: "lemos@gmail.com",
                reservationDate: new Date("2024-03-01"),
                returnDate: new Date("2024-03-02"),
                bookCount: 2,
                isReturned: false,
                isBought: false
            }
        ];

        const books: Book [] = [
            {
                bookId: "21432JK",
                title: "Hamlet",
                author: "Shakespare",
                price: 10,
                publicationYear: 1932,
                publisher: "Petterman",
                stock: 4
            },
            {
                bookId: "242342JI",
                title: "Romeo and Juliet",
                author: "Shakespare",
                price: 20,
                publicationYear: 1921,
                publisher: "Petterman",
                stock: 4
            }
        ];

        mockReservationRepository.findDueReservations.mockResolvedValue(reservations);
        mockUserRepository.incrementBalance.mockResolvedValue(true);
        mockBookRepository.findById
            .mockResolvedValueOnce(books[0])
            .mockResolvedValueOnce(books[1]);

        await reservationService.applyLateReturnCharge();

        expect(mockReservationRepository.findDueReservations).toHaveBeenCalled();
        expect(mockUserRepository.incrementBalance).toHaveBeenCalledTimes(2);
        expect(mockBookRepository.findById).toHaveBeenCalledTimes(2);
    });
})