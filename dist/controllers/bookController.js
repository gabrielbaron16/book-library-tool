"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookById = exports.addBook = exports.searchBooks = exports.getBookById = void 0;
const container_1 = require("../config/container");
const BookMappers_1 = require("../domain/mappers/BookMappers");
const bookService = container_1.container.resolve("IBookService");
const getBookById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const book = yield bookService.getBookById(id);
    if (!book) {
        const errorResponse = {
            message: "Book not found"
        };
        res.status(404).send(errorResponse);
        return;
    }
    res.status(200).send(book);
});
exports.getBookById = getBookById;
const searchBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, author, publicationYear } = req.query;
    try {
        const books = yield bookService.searchBooks(title, author, publicationYear ? parseInt(publicationYear, 10) : undefined);
        const booksResponse = books.map(book => (0, BookMappers_1.mapBookToBookDto)(book));
        if (booksResponse.length === 0) {
            const errorResponse = {
                message: "No books found"
            };
            res.status(404).send(errorResponse);
            return;
        }
        res.status(200).send(booksResponse);
    }
    catch (e) {
        console.log(e);
        const errorResponse = {
            message: "Unexpected error searching books"
        };
        res.status(500).send(errorResponse);
    }
});
exports.searchBooks = searchBooks;
const addBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookDTO = req.body;
    const newBook = (0, BookMappers_1.mapBookDtoToBook)(bookDTO);
    yield bookService.createBook(newBook);
    res.status(201).end();
});
exports.addBook = addBook;
const deleteBookById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deleted = yield bookService.deleteBook(id);
    if (deleted) {
        res.status(200).json({ message: "Book deleted successfully" });
    }
    else {
        res.status(404).json({ message: "Book not found" });
    }
});
exports.deleteBookById = deleteBookById;
