import { BookDTO} from "../../presentation/controllers/dto/BookDTO";
import {Book} from "../entities/Book";

export const mapBookDtoToBook = (bookDto: BookDTO): Book =>
    new Book(bookDto.bookId, bookDto.title, bookDto.author, bookDto.publicationYear, bookDto.publisher, bookDto.price, 4);

export const mapBookToBookDto = (book: Book): BookDTO =>
    new BookDTO(book.bookId, book.title, book.author, book.publicationYear, book.publisher, book.price, book.stock);