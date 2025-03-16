import { Router } from "express";
import {addBook, deleteBookById, getBookById, searchBooks} from "../presentation/controllers/book/BookController";
import {addUser, updateUserBalance} from "../presentation/controllers/user/UserController";
import {addReservation, getReservationsByBookId} from "../presentation/controllers/reservation/ReservationController";

const router = Router();

router.get("/books/search", searchBooks);
router.post("/books", addBook);
router.get("/books/:id", getBookById);
router.delete("/books/:id", deleteBookById);

router.post("/users", addUser);
router.patch("/users/:email/balance", updateUserBalance);

router.post("/reservations", addReservation);
router.get("/reservations/book/:bookId", getReservationsByBookId);

export default router;