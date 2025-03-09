import { injectable } from "tsyringe";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Book } from "../../domain/entities/Book";
import { MongoClient, WithId, Document } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

@injectable()
export class MongoBookRepository implements IBookRepository {
    private collection;

    constructor() {
        const client = new MongoClient(process.env.MONGO_URL!);
        this.collection = client.db("library").collection("books");
        this.createIndexes();
    }

    private async createIndexes() {
        await this.collection.createIndex({ bookId: 1 }, { unique: true });
        await this.collection.createIndex({ title: 1 });
        await this.collection.createIndex({ author: 1 });
        await this.collection.createIndex({ publicationYear: 1 });
    }

    async findById(bookId: string): Promise<Book | null> {
        const doc = await this.collection.findOne({ bookId });
        return doc ? this.mapDocumentToBook(doc) : null;
    }

    async findByFilters(title?: string, author?: string, publicationYear?: number): Promise<Book[]> {
        const query: any = {};
        if (title) query.title = title;
        if (author) query.author = author;
        if (publicationYear) query.publicationYear = publicationYear;
        console.log(query);

        try {
            const docs = await this.collection.find(query).toArray();
            console.log("Books found: ", docs)
            return docs.map(this.mapDocumentToBook);
        } catch (error) {
            console.error("Error finding books:", error);
            throw error;
        }
    }

    async save(book: Book): Promise<void> {
        try {
            await this.collection.insertOne(book);
            console.log("Book saved successfully:", book);
        } catch (error) {
            console.error("Error saving book:", error);
            throw error;
        }
    }

    async delete(bookId: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ bookId });
        return result.deletedCount > 0;
    }

    private mapDocumentToBook(doc: WithId<Document>): Book {
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