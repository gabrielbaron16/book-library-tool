import "reflect-metadata";
import {UserService} from "./UserService";
import {container} from "tsyringe";
import {IUserRepository} from "../../../domain/repositories/IUserRepository";
import {User} from "../../../domain/entities/User";
import {ControlledError} from "../../../domain/errors/ControlledError";

jest.mock("../../../domain/repositories/IUserRepository");

let userService: UserService;
let mockUserRepository: jest.Mocked<IUserRepository>;

beforeEach(() => {
    jest.doMock("../../../domain/repositories/IUserRepository", () => {
        return {
            getBalance: jest.fn(),
            updateBalance: jest.fn(),
            save: jest.fn(),
            exists: jest.fn()
        };
    });

    mockUserRepository = require("../../../domain/repositories/IUserRepository")

    container.registerInstance<IUserRepository>("IUserRepository", mockUserRepository);

    userService = container.resolve(UserService);

});

afterEach(() => {
    jest.resetAllMocks();
    container.reset();
});

describe("UserService", () => {
    it("should create a user successfully", async () => {
        const user: User = { email: "silviodante@gmail.com", balance: 100 };
        mockUserRepository.exists.mockResolvedValue(false);
        mockUserRepository.save.mockResolvedValue(undefined);

        await userService.createUser(user);

        expect(mockUserRepository.exists).toHaveBeenCalledWith("silviodante@gmail.com");
        expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it("should throw an error if the user already exists", async () => {
        const user: User = { email: "silviodante@gmail.com", balance: 100 };
        mockUserRepository.exists.mockResolvedValue(true);

        await expect(userService.createUser(user)).rejects.toThrow(
            new ControlledError("User with email silviodante@gmail.com already exists.")
        );
    });

    it("should update the user balance successfully", async () => {
        mockUserRepository.updateBalance.mockResolvedValue(true);

        const result = await userService.updateBalance("silviodante@gmail.com", 200);

        expect(result).toBe(true);
        expect(mockUserRepository.updateBalance).toHaveBeenCalledWith("silviodante@gmail.com", 200);
    });

    it("should return false if the user balance update fails", async () => {
        mockUserRepository.updateBalance.mockResolvedValue(false);

        const result = await userService.updateBalance("silviodante@gmail.com", 200);

        expect(result).toBe(false);
        expect(mockUserRepository.updateBalance).toHaveBeenCalledWith("silviodante@gmail.com", 200);
    });
});