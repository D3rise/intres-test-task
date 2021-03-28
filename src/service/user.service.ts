import { Repository, UpdateResult } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../entity/User.entity";
import Database from "./db.service";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/user.error";
import { UpdateUserDTO, CreateUserDTO } from "../dto/user.dto";
import { AlreadyExistsError, NotFoundError } from "../error/general.error";

export default class UserService {
  db: Database;
  userRepository: Repository<User>;

  /**
   * Creates new user service
   * @param db Database for the service to work with
   */
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
  async addUser(newUserData: CreateUserDTO): Promise<User> {
    if (await this.usernameExists(newUserData.username)) {
      throw new AlreadyExistsError("User");
    }

    const passwordHash = bcrypt.hashSync(newUserData.password, 10);

    const newUserObject = {
      ...newUserData,
      passwordHash,
    };

    const newUser = this.userRepository.create(newUserObject);
    await this.userRepository.save(newUser);

    return newUser;
  }

  /**
   * Authorizes user with provided credentials
   * @param username User's username
   * @param password User's password
   * @returns JWT token of authorized user
   */
  async login(username: string, password: string): Promise<string> {
    const user = await this.findUserByUsername(username);

    // If user exists
    if (user) {
      const authorized = await bcrypt.compare(password, user.passwordHash);

      // If user is authorized (password compared successfully)
      if (authorized) {
        // Return JWT token of authorized user
        return jwt.sign({ userId: user.id }, process.env.JWT_TOKEN!, {
          expiresIn: "168h",
        });
      } else {
        throw new AuthenticationError("Wrong password");
      }
    }

    // If user doesn't exist, throw an authentication error
    throw new AuthenticationError("User doesn't exist");
  }

  /**
   * Updates user with new data
   * @param username Username of user
   * @param updatedUser User object with updated data
   * @returns Result returned by UpdateQueryBuilder
   */
  async updateUser(
    id: number,
    updatedUser: UpdateUserDTO
  ): Promise<UpdateResult> {
    const user = await this.findUserById(id);
    if (!user) throw new NotFoundError("User");

    return this.userRepository.update(user.id, updatedUser);
  }

  /**
   * Finds user by username
   * @param username Username of user
   * @returns Founded user or undefined
   */
  findUserByUsername(username: string): Promise<User | undefined> {
    return this.findUser({ username });
  }

  /**
   * Finds user by ID
   * @param id ID of user
   * @returns Founded user or undefined
   */
  findUserById(id: number): Promise<User | undefined> {
    return this.findUser({ id });
  }

  /**
   * Finds user by provided data
   * @param user Partial user object (with properties to search by)
   * @returns Founded user or undefined (if user isn't found)
   */
  private findUser(user: Partial<User>): Promise<User | undefined> {
    return this.userRepository.findOne(user);
  }

  /**
   * Checks if user with specified username actually exists
   * @param username Username of user
   * @returns True, if user exists and false if doesn't
   */
  public async usernameExists(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ username });
    return !!user;
  }
}
