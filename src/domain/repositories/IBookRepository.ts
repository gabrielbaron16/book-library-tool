import {Book} from "../entities/Book";

export interface IBookRepository {
    findById(bookId: string): Promise<Book | null>;

    findByFilters(skip: number, limit: number, title?: string, author?: string, publicationYear?: number): Promise<{
        books: Book[],
        totalRecords: number
    }>

    save(book: Book): Promise<void>;

    delete(bookId: string): Promise<boolean>;

    exists(bookId: string): Promise<boolean>;
}