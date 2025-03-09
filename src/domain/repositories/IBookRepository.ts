import { Book } from "../entities/Book";

export interface IBookRepository {
    findById(bookId: string): Promise<Book | null>;
    findByFilters(title?: string, author?: string, publicationYear?: number): Promise<Book[]>;
    save(book: Book): Promise<void>;
    delete(bookId: string): Promise<boolean>;
}