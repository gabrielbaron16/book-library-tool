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

    async searchBooks(title?: string, author?: string, publicationYear?: number): Promise<Book[]> {
        return await this.bookRepository.findByFilters(title, author, publicationYear);
    }

    async createBook(book: Book): Promise<void> {
        const existingBook = await this.bookRepository.findById(book.bookId);
        if (existingBook) {
            throw new RecordAlreadyExistsError(`Book with ID ${book.bookId} already exists.`);
        }
        await this.bookRepository.save(book);
    }

    async deleteBook(id: string): Promise<boolean> {
        return await this.bookRepository.delete(id);
    }
}