import { Router } from "express";
import {addBook, deleteBookById, getBookById, searchBooks} from "../controllers/book/BookController";

const router = Router();

router.get("/books/search", searchBooks)
router.post("/books", addBook);
router.get("/books/:id", getBookById);
router.delete("/books/:id", deleteBookById);

export default router;