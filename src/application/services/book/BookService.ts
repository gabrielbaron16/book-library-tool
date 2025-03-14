import { injectable, inject } from "tsyringe";
import { IBookService } from "./IBookService";
import { IBookRepository } from "../../../domain/repositories/IBookRepository";
import { Book } from "../../../domain/entities/Book";
import {RecordAlreadyExistsError} from "../../../domain/errors/RecordAlreadyExists";

@injectable()
export class BookService implements IBookService {
    constructor(@inject("IBookRepository") private bookRepository: IBookRepository) {}

    async getBookById(id: string): Promise<Book | null> {
        return await this.bookRepository.findById(id);
    }

    async searchBooks(page: number, limit: number, title?: string, author?: string, publicationYear?: number): Promise<{ books: Book[], totalRecords: number }> {
        const skip = (page - 1) * limit;
        return this.bookRepository.findByFilters(skip, limit, title, author, publicationYear);
    }

    async createBook(book: Book): Promise<void> {
        const existingBook = await this.bookRepository.exists(book.bookId);
        if (existingBook) {
            throw new RecordAlreadyExistsError(`Book with ID ${book.bookId} already exists.`);
        }
        await this.bookRepository.save(book);
    }

    async deleteBook(id: string): Promise<boolean> {
        return await this.bookRepository.delete(id);
    }
}