import { injectable } from "tsyringe";
import { IReservationRepository } from "../../domain/repositories/IReservationRepository";
import { ReservationModel } from "../models/ReservationModel";
import {Reservation} from "../../domain/entities/Reservation";
import mongoose from "mongoose";
import {BookModel} from "../models/BookModel";

@injectable()
export class MongoReservationRepository implements IReservationRepository {

    async save(reservation: Reservation): Promise<boolean> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const newUser = new ReservationModel(reservation);
            await newUser.save({ session });

            const book = await BookModel.findOneAndUpdate(
                { bookId: reservation.bookId },
                { $inc: { stock: -reservation.bookCount } },
                { session, new: true }
            );

            if (!book) {
                await session.abortTransaction();
                console.log("Book not found:", reservation.bookId);
                return false;
            }
            await session.commitTransaction();
            console.log("Reservation saved successfully:", reservation);
            return true
        } catch (error) {
            await session.abortTransaction();
            console.error("Error saving reservation:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async findByBookId(bookId: string, offset: number, limit: number): Promise<{ reservations: Reservation[], totalRecords: number }> {
        const reservations = await ReservationModel.find({ bookId }).skip(offset).limit(limit).exec();
        const totalRecords = await ReservationModel.countDocuments({ bookId }).exec();
        return { reservations, totalRecords };
    }
}