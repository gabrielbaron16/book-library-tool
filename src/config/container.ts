import "reflect-metadata";
import { container } from "tsyringe";
import { IBookRepository } from "../domain/repositories/IBookRepository";
import { MongoBookRepository } from "../infrastructure/repositories/MongoBookRepository";
import { IBookService } from "../application/services/book/IBookService";
import { BookService } from "../application/services/book/BookService";

container.register<IBookRepository>("IBookRepository", { useClass: MongoBookRepository });
container.register<IBookService>("IBookService", { useClass: BookService });


export { container };