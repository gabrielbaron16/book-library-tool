import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
    bookId: string;
    title: string;
    author: string;
    publicationYear: number;
    publisher?: string;
    price?: number;
    stock?: number;
}

const BookSchema = new Schema<IBook>({
    bookId: { type: String, required: true, unique: true },
    title: { type: String, required: true, index: true },
    author: { type: String, required: true, index: true },
    publicationYear: { type: Number, required: true, index: true },
    publisher: { type: String },
    price: { type: Number },
    stock: { type: Number}
});

export const BookModel = mongoose.model<IBook>("Book", BookSchema);