import "reflect-metadata";
import { container } from "tsyringe";
import { IBookRepository } from "../domain/repositories/IBookRepository";
import { MongoBookRepository } from "../infrastructure/repositories/MongoBookRepository";
import { IBookService } from "../application/services/book/IBookService";
import { BookService } from "../application/services/book/BookService";
import {MongoUserRepository} from "../infrastructure/repositories/MongoUserRepository";
import {IUserRepository} from "../domain/repositories/IUserRepository";
import {IUserService} from "../application/services/user/IUserService";
import {UserService} from "../application/services/user/UserService";

container.register<IBookRepository>("IBookRepository", { useClass: MongoBookRepository });
container.register<IBookService>("IBookService", { useClass: BookService });

container.register<IUserRepository>("IUserRepository", { useClass: MongoUserRepository });
container.register<IUserService>("IUserService", { useClass: UserService });


export { container };