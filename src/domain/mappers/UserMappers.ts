import { UserDTO} from "../../controllers/dto/UserDTO";
import {User} from "../entities/User";

export const mapUserDtoToUser = (userDto: UserDTO): User =>
    new User(userDto.email, userDto.balance);