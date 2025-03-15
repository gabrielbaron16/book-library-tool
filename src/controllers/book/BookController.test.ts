import "reflect-metadata";
import { container } from "../../config/container";
import request from "supertest";
import { IBookService } from "../../application/services/book/IBookService";
import { ControlledError } from "../../domain/errors/ControlledError";
import {Book} from "../../domain/entities/Book";
import {ErrorResponseDTO} from "../dto/Error";
import {BookDTO} from "../dto/BookDTO";
import {mapBookToBookDto} from "../../domain/mappers/BookMappers";

jest.mock("../../application/services/book/IBookService");

let mockBookService: jest.Mocked<IBookService>;
let app: any;

beforeAll(async () => {
    jest.doMock("../../application/services/book/IBookService", () => {
        return {
            createBook: jest.fn(),
            getBookById: jest.fn(),
            searchBooks: jest.fn(),
            deleteBook: jest.fn(),
        };
    });

    mockBookService = require("../../application/services/book/IBookService");

    container.registerInstance<IBookService>("IBookService", mockBookService);

    const { app: importedApp } = await import("../../index");
    app = importedApp;
});

afterEach(() => {
    jest.resetAllMocks();
    container.reset();
});

describe("GET /books/:id", () => {
    it("Should return an existing book", async () => {
        const mockBook: Book = {
            bookId: "342535HD1",
            title: "1984",
            author: "George Orwell",
            publicationYear: 2023,
            publisher: "Newman Publisher",
            price: 10,
            stock: 4,
        };

        mockBookService.getBookById.mockResolvedValue(mockBook);

        const response = await request(app).get("/books/342535HD1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mapBookToBookDto(mockBook));
    });

    it("Should return 404 if book does not exists", async () => {
        mockBookService.getBookById.mockResolvedValue(null);

        const response = await request(app).get("/books/9953453JH");

        expect(response.status).toBe(404);
        const errorResponse: ErrorResponseDTO = {
            message: "Book not found"
        }
        expect(response.body).toEqual(errorResponse);
    });
});

describe("GET /books/search", () => {
    it("should return a list of books", async () => {
        const mockBooks: Book[] = [
            { bookId: "24234235AS", title: "Don Quijote de la Mancha", author: "Miguel de Cervantes", publicationYear: 1605, publisher: "Castellana", price: 15, stock: 4 },
            { bookId: "24234235BS", title: "El Coloquio de lo Perros", author: "Miguel de Cervantes", publicationYear: 1613, publisher: "Castellana", price: 15, stock: 4 },
        ];
        const totalRecords = 2;

        mockBookService.searchBooks.mockResolvedValue({ books: mockBooks, totalRecords });

        const response = await request(app).get("/books/search?author=Miguel de Cervantes&page=1&limit=10");

        expect(response.status).toBe(200);
        expect(response.body.books).toHaveLength(2);
        expect(response.body.totalRecords).toBe(totalRecords);
    });

    it("Should return 404 if there's no book", async () => {
        mockBookService.searchBooks.mockResolvedValue({ books: [], totalRecords: 0 });

        const response = await request(app).get("/books/search?author=Unknown&page=1&limit=10");

        expect(response.status).toBe(404);
        const errorResponse: ErrorResponseDTO = {
            message: "No books found"
        }
        expect(response.body).toEqual(errorResponse);
    });
});

describe("POST /books", () => {
    it("should create a book and return 201", async () => {
        mockBookService.createBook.mockResolvedValue(undefined);

        const newBook: BookDTO = {
            bookId: "342535HD1",
            title: "1984",
            author: "George Orwell",
            publicationYear: 2023,
            publisher: "Newman Publisher",
            price: 10,
        };

        const response = await request(app).post("/books").send(newBook);

        expect(response.status).toBe(201);
    });

    it("should return 400 if the book already exists in database", async () => {
        mockBookService.createBook.mockRejectedValue(
            new ControlledError("Book with ID 342535HD1 already exists.")
        );

        const newBook: BookDTO = {
            bookId: "342535HD1",
            title: "1984",
            author: "George Orwell",
            publicationYear: 2023,
            publisher: "Newman Publisher",
            price: 10,
        };

        const response = await request(app).post("/books").send(newBook);

        const errorResponse: ErrorResponseDTO = {
            message: `Book with ID ${newBook.bookId} already exists.`
        };
        expect(response.status).toBe(400);
        expect(response.body).toEqual(errorResponse);
    });
});

describe("DELETE /books/:id", () => {
    it("should delete a book and return 200", async () => {
        mockBookService.deleteBook.mockResolvedValue(true);

        const response = await request(app).delete("/books/1234HG123");

        expect(response.status).toBe(200);
    });

    it("Should return 404 if book does not exist", async () => {
        mockBookService.deleteBook.mockResolvedValue(false);

        const response = await request(app).delete("/books/994546A1");

        const errorResponse: ErrorResponseDTO = {
            message: "Book not found"
        }
        expect(response.body).toEqual(errorResponse);
    });
});
