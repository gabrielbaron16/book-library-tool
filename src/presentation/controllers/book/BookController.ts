import { Request, Response } from "express";
import { container } from "../../../config/container";
import { IBookService } from "../../../application/services/book/IBookService";
import { BookDTO } from "../dto/BookDTO";
import { mapBookDtoToBook, mapBookToBookDto } from "../../../domain/mappers/BookMappers";
import { ErrorResponseDTO } from "../dto/Error";
import { ControlledError } from "../../../domain/errors/ControlledError";

const bookService = container.resolve<IBookService>("IBookService");

export const getBookById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const book = await bookService.getBookById(id);
        if (!book) {
            const errorResponse: ErrorResponseDTO = {
                message: "Book not found"
            };
            res.status(404).send(errorResponse);
            return;
        }
        res.status(200).send(book);
    } catch (e) {
        const errorResponse: ErrorResponseDTO = {
            message: "Unexpected error fetching book information"
        };
        res.status(500).send(errorResponse);
    }
};

export const searchBooks = async (req: Request, res: Response) => {
    const { title, author, publicationYear, page, limit } = req.query;
    try {
        const { books, totalRecords } = await bookService.searchBooks(
            parseInt(page as string, 10),
            parseInt(limit as string, 10),
            title as string | undefined,
            author as string | undefined,
            publicationYear ? parseInt(publicationYear as string, 10) : undefined
        );
        if (!books || books.length === 0) {
            const errorResponse: ErrorResponseDTO = {
                message: "No books found"
            };
            res.status(404).send(errorResponse);
            return;
        }
        const booksResponse = books.map(book => mapBookToBookDto(book));
        res.status(200).send({ books: booksResponse, totalRecords });
    } catch (e) {
        const errorResponse: ErrorResponseDTO = {
            message: "Unexpected error searching books"
        };
        res.status(500).send(errorResponse);
    }
};

export const addBook = async (req: Request, res: Response) => {
    try{
        const bookDTO: BookDTO = req.body;
        const newBook = mapBookDtoToBook(bookDTO);
        await bookService.createBook(newBook);
        res.status(201).end();
    } catch (e) {
        let errorResponse: ErrorResponseDTO;
        if (e instanceof ControlledError) {
            errorResponse = {
                message: e.message
            };
            res.status(400).send(errorResponse);
        } else {
           errorResponse = {
                message: "Unexpected error adding a new book"
            };
            res.status(500).send(errorResponse);
        }
    }
};

export const deleteBookById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await bookService.deleteBook(id);
        if (deleted) {
            res.status(200).end();
        } else {
            const errorResponse: ErrorResponseDTO = {
                message: "Book not found"
            };
            res.status(404).send(errorResponse);
        }
    } catch (e) {
        const errorResponse: ErrorResponseDTO = {
            message: "Unexpected error deleting a book"
        };
        res.status(500).send(errorResponse);
    }
};