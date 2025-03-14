import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    balance: number;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    balance: { type: Number, required: true }
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);