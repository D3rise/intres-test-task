import path from "path";
import dotenv from "dotenv";
import Database from "../../src/service/db.service";
import UserService from "../../src/service/user.service";
import jwt from "jsonwebtoken";
import {
  AlreadyExistsError,
  NotFoundError,
} from "../../src/error/general.error";
import { AuthenticationError } from "../../src/error/user.error";

let db: Database;
let userService: UserService;

dotenv.config({
  path: path.join(__dirname, "..", "..", "development.env"),
});

beforeEach(async (done) => {
  db = new Database();
  db.connect({
    type: "postgres",
    url: process.env.DB_URL,
    entities: [path.join(__dirname, "..", "..", "src", "entity", "*.ts")],
    dropSchema: true,
    synchronize: true,
  }).then(() => {
    userService = new UserService(db);
    done();
  });
});

afterEach(() => {
  try {
    db.getConnection().close();
  } catch (e) {
    return;
  }
});

describe("find functions", () => {
  it("should return already existing user by id", async () => {
    const newUser = await userService.addUser({
      username: "Nagibator1337",
      password: "qwerty",
    });

    const user = await userService.findUserById(newUser.id);
    expect(user).not.toBeUndefined();
    expect(user).toHaveProperty("username", "Nagibator1337");
  });

  it("should not find user by id", async () => {
    const user = await userService.findUserById(1);
    expect(user).toBeUndefined();
  });

  it("should not find user by username", async () => {
    const user = await userService.findUserByUsername("Nagibator1337");
    expect(user).toBeUndefined();
  });
});

describe("create and update functions", () => {
  beforeEach(async () => {
    await userService.addUser({
      username: "Nagibator1337",
      password: "qwerty",
    });
  });

  it("should create new user", async () => {
    const user = await userService.findUserByUsername("Nagibator1337");
    expect(user).not.toBeUndefined();
    expect(user).toHaveProperty("username", "Nagibator1337");
  });

  it("should return error that user already exists", async () => {
    expect(
      userService.addUser({ username: "Nagibator1337", password: "123556" })
    ).resolves.toThrowError(new AlreadyExistsError("User"));
  });

  it("should update user with new data", async () => {
    userService.updateUser(1, { username: "DungeonMaster" });
    const foundUser = await userService.findUserById(1);

    expect(foundUser).toHaveProperty("username", "DungeonMaster");
  });

  it("should not throw NotFound error", async () => {
    expect(
      userService.updateUser(2, { username: "Zelda" })
    ).resolves.toThrowError(new NotFoundError("User"));
  });
});

describe("login function", () => {
  beforeEach(async () => {
    await userService.addUser({
      username: "Nagibator1337",
      password: "11092001",
    });
  });

  it("should authenticate user", async () => {
    const token = await userService.login("Nagibator1337", "11092001");
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN!);
    expect(decodedToken).toHaveProperty("userId", 1);
  });

  it("should return authenticate error because password is wrong", () => {
    expect(
      userService.login("Nagibator1337", "02092004")
    ).resolves.toThrowError(new AuthenticationError("Wrong password"));
  });

  it("should return error because user doesn't exist", () => {
    expect(
      userService.login("DungeonMaster", "02092004")
    ).resolves.toThrowError(new AuthenticationError("User doesn't exist"));
  });
});
