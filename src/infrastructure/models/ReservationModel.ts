import mongoose, { Schema, Document } from "mongoose";

export interface IReservation extends Document {
    userEmail: string;
    bookId: string;
    bookCount: number;
    reservationDate: Date;
    returnDate: Date;
    isReturned: boolean;
}

const ReservationSchema = new Schema<IReservation>({
    userEmail: { type: String, required: true, index: true },
    bookId: { type: String, required: true, index: true },
    bookCount: { type: Number, required: true },
    reservationDate: { type: Date, required: true },
    returnDate: { type: Date, required: true, index: true },
    isReturned: { type: Boolean, required: true, index: true }
});

export const ReservationModel = mongoose.model<IReservation>("Reservation", ReservationSchema);