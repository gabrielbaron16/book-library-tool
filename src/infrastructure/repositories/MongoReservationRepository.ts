import {injectable} from "tsyringe";
import {IReservationRepository} from "../../domain/repositories/IReservationRepository";
import {ReservationModel} from "../models/ReservationModel";
import {Reservation} from "../../domain/entities/Reservation";
import mongoose from "mongoose";
import {BookModel} from "../models/BookModel";
import logger from "../../config/logger";

@injectable()
export class MongoReservationRepository implements IReservationRepository {

    async findById(reservationId: string): Promise<Reservation | null> {
        const doc = await ReservationModel.findOne({_id: reservationId}).lean();
        return doc ? {
            ...doc,
            id: doc._id.toString()
        } : null;
    }

    async save(reservation: Reservation): Promise<boolean> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const newReservation = new ReservationModel(reservation);
            await newReservation.save({session});

            const book = await BookModel.findOneAndUpdate(
                {bookId: reservation.bookId},
                {$inc: {stock: -reservation.bookCount}},
                {session, new: true}
            );

            if (!book) {
                await session.abortTransaction();
                logger.warn("Book not found:", reservation.bookId);
                return false;
            }
            await session.commitTransaction();
            logger.debug("Reservation saved successfully:", reservation);
            return true
        } catch (error) {
            await session.abortTransaction();
            logger.error({err: error}, "Error saving reservation:");
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async findActiveByBookId(bookId: string): Promise<Reservation[]> {
        const reservations = await ReservationModel.find({
            isReturned: false,
            bookId: bookId
        }).lean();
        return reservations.map(doc => ({
            ...doc,
            id: doc._id.toString()
        }));
    }

    async findByBookId(bookId: string, offset: number, limit: number): Promise<{
        reservations: Reservation[],
        totalRecords: number
    }> {
        const reservations = await ReservationModel.find({bookId}).skip(offset).limit(limit).lean();
        const totalRecords = await ReservationModel.countDocuments({bookId}).exec();
        return {
            reservations: reservations.map(doc => ({
                ...doc,
                id: doc._id.toString()
            })),
            totalRecords
        };
    }

    async findDueReservations(dueSoonDate: Date): Promise<Reservation[]> {
        const query = {
            isReturned: false,
            $or: [
                {returnDate: {$gte: dueSoonDate}}
            ]
        };

        const reservations = await ReservationModel.find(query).lean();
        return reservations.map(doc => ({
            ...doc,
            id: doc._id.toString()
        }));
    }

    async finishReservation(reservation: Reservation, realReturnDate: Date): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const result = await ReservationModel.updateOne(
                {_id: reservation.id},
                {$set: {isReturned: true, realReturnDate: realReturnDate}},
                {session}
            );
            if (result.matchedCount === 0) {
                throw new Error("Reservation not found: " + reservation.id);
            }
            const book = await BookModel.findOneAndUpdate(
                {bookId: reservation.bookId},
                {$inc: {stock: +reservation.bookCount}},
                {session, new: true}
            );

            if (!book) {
                throw new Error("Book not found: " + reservation.bookId);
            }
            await session.commitTransaction();
            logger.debug("Reservation saved successfully:", reservation);
            return;
        } catch (error) {
            await session.abortTransaction();
            logger.error({err: error}, "Error finishing reservation:");
            throw error;
        } finally {
            await session.endSession();
        }
    }
}