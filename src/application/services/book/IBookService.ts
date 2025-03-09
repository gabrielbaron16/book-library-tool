import { Book } from "../../../domain/entities/Book";

export interface IBookService {
    getBookById(id: string): Promise<Book | null>;
    searchBooks(title?: string, author?: string, publicationYear?: number): Promise<Book[]>;
    createBook(book: Book): Promise<void>;
    deleteBook(id: string): Promise<boolean>;
}