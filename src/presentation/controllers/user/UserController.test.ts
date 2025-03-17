import "reflect-metadata";
import { container } from "../../../config/container";
import request from "supertest";
import { IUserService } from "../../../application/services/user/IUserService";
import { ControlledError } from "../../../domain/errors/ControlledError";
import {ErrorResponseDTO} from "../dto/Error";
import {UserDTO} from "../dto/UserDTO";

jest.mock("../../../application/services/user/IUserService");

let mockUserService: jest.Mocked<IUserService>;
let app: any;

beforeAll(async () => {
    jest.doMock("../../../application/services/user/IUserService", () => {
        return {
            createUser: jest.fn(),
            updateBalance: jest.fn(),
        };
    });

    mockUserService = require("../../../application/services/user/IUserService");

    container.registerInstance<IUserService>("IUserService", mockUserService);

    const { app: importedApp } = await import("../../../index");
    app = importedApp;
});

afterEach(() => {
    jest.resetAllMocks();
    container.reset();
});

describe("POST /user", () => {
    it("should create a User and return 201", async () => {
        mockUserService.createUser.mockResolvedValue(undefined);

        const newUser: UserDTO = {
            email: "richardgasquet@gmail.com",
            balance: 20
        };

        const response = await request(app).post("/Users").send(newUser);

        expect(response.status).toBe(201);
    });

    it("should return 400 if the User already exists in database", async () => {
        mockUserService.createUser.mockRejectedValue(
            new ControlledError("User with email richardgasquet@gmail.com already exists.")
        );

        const newUser: UserDTO = {
            email: "richardgasquet@gmail.com",
            balance: 20
        };
        const response = await request(app).post("/users").send(newUser);

        const errorResponse: ErrorResponseDTO = {
            message: `User with email ${newUser.email} already exists.`
        };
        expect(response.status).toBe(400);
        expect(response.body).toEqual(errorResponse);
    });

    it("should return 500 if there are an unexpected error creating the user", async () => {
        mockUserService.createUser.mockRejectedValue(
            new Error("Database connection error")
        );

        const newUser: UserDTO = {
            email: "richardgasquet@gmail.com",
            balance: 20
        };

        const response = await request(app).post("/users").send(newUser);

        const errorResponse: ErrorResponseDTO = {
            message: `Unexpected error adding a new user`
        };
        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse);
    });
});

describe("PATCH /users/:email/balance", () => {
    it("should update the user balance and return 204", async () => {
        mockUserService.updateBalance.mockResolvedValue(true);

        const body = {
            balance: 20
        };

        const response = await request(app).patch("/users/richardgasquet@gmail.com/balance").send(body);

        expect(response.status).toBe(200);
    });

    it("should return 204 because there's no user with that email", async () => {
        mockUserService.updateBalance.mockResolvedValue(false);

        const body = {
            balance: 20
        };

        const response = await request(app).patch("/users/richardgasquet@gmail.com/balance").send(body);

        expect(response.status).toBe(404);
    });

    it("should return 500 if there are an unexpected error updating the balance", async () => {
        mockUserService.updateBalance.mockRejectedValue(
            new Error("Database connection error")
        );

        const body = {
            balance: 20
        };

        const response = await request(app).patch("/users/richardgasquet@gmail.com/balance").send(body);

        const errorResponse: ErrorResponseDTO = {
            message: `Unexpected error updating user balance`
        };
        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse);
    });
});