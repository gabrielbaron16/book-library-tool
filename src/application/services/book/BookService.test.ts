import "reflect-metadata";
import {BookService} from "./BookService";
import {container} from "tsyringe";
import {IBookRepository} from "../../../domain/repositories/IBookRepository";
import {Book} from "../../../domain/entities/Book";
import {ControlledError} from "../../../domain/errors/ControlledError";

jest.mock("../../../domain/repositories/IBookRepository");

let bookService: BookService;
let mockBookRepository: jest.Mocked<IBookRepository>;

beforeEach(() => {
    jest.doMock("../../../domain/repositories/IBookRepository", () => {
        return {
            findById: jest.fn(),
            findByFilters: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn()
        };
    });

    mockBookRepository = require("../../../domain/repositories/IBookRepository")

    container.registerInstance<IBookRepository>("IBookRepository", mockBookRepository);

    bookService = container.resolve(BookService);

});

afterEach(() => {
    jest.resetAllMocks();
    container.reset();
});

describe("BookService", () => {
    it("should get a book by ID", async () => {
        const book: Book = {
            bookId: "342535HD1",
            title: "1984",
            author: "George Orwell",
            publicationYear: 2023,
            publisher: "Newman Publisher",
            price: 10,
            stock: 4
        };
        mockBookRepository.findById.mockResolvedValue(book);

        const result = await bookService.getBookById("342535HD1");

        expect(result).toEqual(book);
        expect(mockBookRepository.findById).toHaveBeenCalledWith("342535HD1");
    });

    it("should return null if the book is not found", async () => {
        mockBookRepository.findById.mockResolvedValue(null);

        const result = await bookService.getBookById("342535HD1");

        expect(result).toBeNull();
        expect(mockBookRepository.findById).toHaveBeenCalledWith("342535HD1");
    });

    it("should search books with filters", async () => {
        const books: Book[] = [
            {
                bookId: "342535HD1",
                title: "1984",
                author: "George Orwell",
                publicationYear: 2023,
                publisher: "Newman Publisher",
                price: 10,
                stock: 4
            },
        ];
        mockBookRepository.findByFilters.mockResolvedValue({books, totalRecords: 1});

        const result = await bookService.searchBooks(1, 10, "1984", "George Orwell", 2021);

        expect(result).toEqual({books, totalRecords: 1});
        expect(mockBookRepository.findByFilters).toHaveBeenCalledWith(0, 10, "1984", "George Orwell", 2021);
    });

    it("should create a book successfully", async () => {
        const book: Book = {
            bookId: "342535HD1",
            title: "1984",
            author: "George Orwell",
            publicationYear: 2023,
            publisher: "Newman Publisher",
            price: 10,
            stock: 4
        };
        mockBookRepository.exists.mockResolvedValue(false);
        mockBookRepository.save.mockResolvedValue(undefined);

        await bookService.createBook(book);

        expect(mockBookRepository.exists).toHaveBeenCalledWith("342535HD1");
        expect(mockBookRepository.save).toHaveBeenCalledWith(book);
    });

    it("should throw an error if the book already exists", async () => {
        const book: Book = {
            bookId: "342535HD1",
            title: "1984",
            author: "George Orwell",
            publicationYear: 2023,
            publisher: "Newman Publisher",
            price: 10,
            stock: 4
        };
        mockBookRepository.exists.mockResolvedValue(true);

        await expect(bookService.createBook(book)).rejects.toThrow(
            new ControlledError("Book with ID 342535HD1 already exists.")
        );
    });

    it("should delete a book by ID", async () => {
        mockBookRepository.delete.mockResolvedValue(true);

        const result = await bookService.deleteBook("342535HD1");

        expect(result).toBe(true);
        expect(mockBookRepository.delete).toHaveBeenCalledWith("342535HD1");
    });
});