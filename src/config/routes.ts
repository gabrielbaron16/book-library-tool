import { Router } from "express";
import {addBook, deleteBookById, getBookById, searchBooks} from "../controllers/book/BookController";
import {addUser, updateUserBalance} from "../controllers/user/UserController";

const router = Router();

router.get("/books/search", searchBooks);
router.post("/books", addBook);
router.get("/books/:id", getBookById);
router.delete("/books/:id", deleteBookById);

router.post("/users", addUser);
router.patch("/users/:email/balance", updateUserBalance);

export default router;