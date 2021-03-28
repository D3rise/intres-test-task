import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../entity/User.entity";
import Database from "./db.service";

export default class UserService {
  db: Database;
  userRepository: Repository<User>;

  constructor(db: Database) {
    this.db = db;
    this.userRepository = this.db.Manager.getRepository(User);
  }

  /**
   * Creates new user with specified username and password
   * @param username Username of new user
   * @param password Password of new user
   * @returns Newly created user
   */
  addUser(username: string, password: string): User {
    if (this.usernameExists(username)) {
      throw new Error("user already exists");
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = this.userRepository.create({ username, passwordHash });

    return newUser;
  }

  /**
   * Checks if user with specified username actually exists
   * @param username Username of user
   * @returns True, if user exists and false if doesn't
   */
  usernameExists(username: string): boolean {
    const user = this.userRepository.findOne({ username });
    return !!user;
  }
}
