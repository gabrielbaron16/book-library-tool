import { User } from "../entities/User";

export interface IUserRepository {
    save(user: User): Promise<void>;
    getBalance(email: string): Promise<number | null>;
    updateBalance(email: string, newBalance: number): Promise<boolean>;
    exists(email: string): Promise<boolean>;
}