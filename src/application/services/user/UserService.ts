import { injectable, inject } from "tsyringe";
import { IUserService } from "./IUserService";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import {ControlledError} from "../../../domain/errors/ControlledError";

@injectable()
export class UserService implements IUserService {
    constructor(@inject("IUserRepository") private userRepository: IUserRepository) {}

    async createUser(user: User): Promise<void> {
        const existingUser = await this.userRepository.exists(user.email);
        if (existingUser) {
            throw new ControlledError(`User with email ${user.email} already exists.`);
        }
        await this.userRepository.save(user);
    }

    async updateBalance(email: string, newBalance: number): Promise<boolean> {
        return await this.userRepository.updateBalance(email, newBalance);
    }
}