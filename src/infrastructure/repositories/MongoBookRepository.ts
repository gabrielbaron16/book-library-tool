import { injectable } from "tsyringe";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Book } from "../../domain/entities/Book";
import { BookModel } from "../models/BookModel";
import logger from "../../config/logger";

@injectable()
export class MongoBookRepository implements IBookRepository {

    async findById(bookId: string): Promise<Book | null> {
        const doc = await BookModel.findOne({ bookId }).lean();
        return doc ? this.mapDocumentToBook(doc) : null;
    }

    async findByFilters(skip: number, limit: number, title?: string, author?: string, publicationYear?: number): Promise<{ books: Book[], totalRecords: number }> {
        const query: any = {};
        if (title) query.title = title;
        if (author) query.author = author;
        if (publicationYear) query.publicationYear = publicationYear;

        try {
            const totalRecords = await BookModel.countDocuments(query);
            const docs = await BookModel.find(query).skip(skip).limit(limit).lean();
            const books = docs.map(this.mapDocumentToBook);
            return { books, totalRecords };
        } catch (error) {
            console.error("Error finding books:", error);
            throw error;
        }
    }

    async save(book: Book): Promise<void> {
        try {
            await BookModel.create(book);
            logger.debug("Book saved successfully:", book);
        } catch (error) {
            logger.error("Error saving book:", error);
            throw error;
        }
    }

    async delete(bookId: string): Promise<boolean> {
        const result = await BookModel.deleteOne({ bookId });
        return result.deletedCount > 0;
    }

    async exists(bookId: string): Promise<boolean> {
        return await BookModel.exists({ bookId }) !== null;
    }

    private mapDocumentToBook(doc: any): Book {
        return {
            bookId: doc.bookId,
            title: doc.title,
            author: doc.author,
            publicationYear: doc.publicationYear,
            publisher: doc.publisher,
            price: doc.price,
            stock: doc.stock
        };
    }
}
