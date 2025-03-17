import { injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserModel, IUser } from "../models/UserModel";
import logger from "../../config/logger";

@injectable()
export class MongoUserRepository implements IUserRepository {

    async save(user: IUser): Promise<void> {
        try {
            const newUser = new UserModel(user);
            await newUser.save();
            logger.debug("User saved successfully:", user);
        } catch (error) {
            logger.error({ err: error },"Error saving user:");
            throw error;
        }
    }

    async getBalance(email: string): Promise<number | null> {
        const user = await UserModel.findOne({ email }).select("balance").lean();
        return user ? user.balance : null;
    }

    async updateBalance(email: string, newBalance: number): Promise<boolean> {
        const result = await UserModel.updateOne(
            { email },
            { $set: { balance: newBalance } }
        );
        return result.matchedCount > 0;
    }

    async exists(email: string): Promise<boolean> {
        return await UserModel.exists({ email }) !== null;
    }
}
