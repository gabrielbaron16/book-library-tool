import { User } from "../../../domain/entities/User";

export interface IUserService {
    createUser(user: User): Promise<void>;
    updateBalance(email: string, newBalance: number): Promise<boolean>;
}