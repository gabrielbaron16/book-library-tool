import { Request, Response } from "express";
import { container } from "../../config/container";
import { IBookService } from "../../application/services/book/IBookService";
import {BookDTO} from "../dto/BookDTO";
import {mapBookDtoToBook, mapBookToBookDto} from "../../domain/mappers/BookMappers";
import {ErrorResponseDTO} from "../dto/Error";
import {RecordAlreadyExistsError} from "../../domain/errors/RecordAlreadyExists";

const bookService = container.resolve<IBookService>("IBookService");

export const getBookById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const book = await bookService.getBookById(id);
    if (!book) {
        const errorResponse: ErrorResponseDTO = {
            message: "Book not found"
        };
        res.status(404).send(errorResponse);
        return;
    }
    res.status(200).send(book)
};

export const searchBooks = async (req: Request, res: Response) => {
    const { title, author, publicationYear } = req.query;
    try {
        const books = await bookService.searchBooks(
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
        res.status(200).send(booksResponse);
    } catch (e) {
        console.log(e)
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
        if (e instanceof RecordAlreadyExistsError) {
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
    const deleted = await bookService.deleteBook(id);
    if (deleted) {
        res.status(200).end();
    } else {
        const errorResponse: ErrorResponseDTO = {
            message: "Book not found"
        };
        res.status(404).send(errorResponse);
    }
};