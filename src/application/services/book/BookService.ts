import {injectable, inject} from "tsyringe";
import {IBookService} from "./IBookService";
import {IBookRepository} from "../../../domain/repositories/IBookRepository";
import {Book} from "../../../domain/entities/Book";
import {ControlledError} from "../../../domain/errors/ControlledError";
import {IReservationRepository} from "../../../domain/repositories/IReservationRepository";

@injectable()
export class BookService implements IBookService {
    constructor(@inject("IBookRepository") private bookRepository: IBookRepository,
                @inject("IReservationRepository") private reservationRepository: IReservationRepository) {
    }

    async getBookById(id: string): Promise<Book | null> {
        return await this.bookRepository.findById(id);
    }

    async searchBooks(page: number, limit: number, title?: string, author?: string, publicationYear?: number): Promise<{
        books: Book[],
        totalRecords: number
    }> {
        const skip = (page - 1) * limit;
        return this.bookRepository.findByFilters(skip, limit, title, author, publicationYear);
    }

    async createBook(book: Book): Promise<void> {
        const existingBook = await this.bookRepository.exists(book.bookId);
        if (existingBook) {
            throw new ControlledError(`Book with ID ${book.bookId} already exists.`);
        }
        await this.bookRepository.save(book);
    }

    async deleteBook(id: string): Promise<boolean> {
        const activeReservations = await this.reservationRepository.findActiveByBookId(id);
        if (activeReservations && activeReservations.length > 0) {
            throw new ControlledError(`Book with ID ${id} has active reservations, can't be deleted.`);
        }
        return await this.bookRepository.delete(id);
    }
}