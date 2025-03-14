import {Book} from "../../../domain/entities/Book";

export interface IBookService {
    getBookById(id: string): Promise<Book | null>;

    searchBooks(skip: number, limit: number, title?: string, author?: string, publicationYear?: number): Promise<{
        books: Book[],
        totalRecords: number
    }>;

    createBook(book: Book): Promise<void>;

    deleteBook(id: string): Promise<boolean>;
}