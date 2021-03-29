import ChatService from "../../src/service/chat.service";
import Database from "../../src/service/db.service";
import SocketService from "../../src/service/socket.service";
import UserService from "../../src/service/user.service";
import { User } from "../../src/entity/User.entity";

import path from "path";
import http from "http";
import dotenv from "dotenv";
import { Chat } from "../../src/entity/Chat.entity";
import { NotFoundError } from "../../src/error/general.error";

dotenv.config({
  path: path.join(__dirname, "..", "..", "development.env"),
});

let chatService: ChatService;
let socketService: SocketService;
let userService: UserService;
let httpServer: http.Server;
let db: Database;

beforeEach(async (done) => {
  db = new Database();
  db.connect({
    type: "postgres",
    url: process.env.DB_URL,
    entities: [path.join(__dirname, "..", "..", "src", "entity", "*.ts")],
    dropSchema: true,
    synchronize: true,
  }).then(() => {
    httpServer = http.createServer();
    socketService = new SocketService(httpServer);
    httpServer.listen();

    userService = new UserService(db);
    chatService = new ChatService(db, socketService);
    done();
  });
});

afterEach(async () => {
  try {
    await db.getConnection().close();
    httpServer.close();
    socketService.close();
  } catch (e) {
    return;
  }
});

// TODO: Add/remove member from chat tests
// TODO: Delete chat tests

describe("find functions", () => {
  let testChat: Chat;
  beforeEach(async () => {
    const testUser = await userService.addUser({
      username: "Tinkov302",
      password: "bigcashbigmoney",
    });

    testChat = await chatService.createChat(
      {
        title: "Tosters",
      },
      testUser
    );
  });

  it("should find and return chat", async () => {
    const chat = await chatService.findChatById(testChat.id);

    expect(chat).toHaveProperty("title", "Tosters");
  });
});

describe("update and create functions", () => {
  let testUser: User;
  beforeEach((done) => {
    userService
      .addUser({
        username: "PerfomanceArtist2007",
        password: "keyboardcat",
      })
      .then((user) => {
        testUser = user;
        done();
      });
  });

  it("should create and return new chat", async () => {
    const chat = await chatService.createChat({ title: "Intres" }, testUser);

    expect(chat).not.toBeUndefined();
    expect(chat.author).toHaveProperty("username", "PerfomanceArtist2007");
    expect(chat).toHaveProperty("title", "Intres");
  });

  it("should update chat with new title", async () => {
    let chat: Chat | undefined = await chatService.createChat(
      { title: "The Gym" },
      testUser
    );

    await chatService.updateChat(chat.id, { title: "Intres" });
    chat = await chatService.findChatById(chat.id);

    expect(chat).toHaveProperty("title", "Intres");
  });

  it("should not update chat and return not found error", () => {
    const chat = chatService.updateChat(2, {
      title: "Pavel Durov News",
    });

    expect(chat).resolves.toThrow(new NotFoundError("Chat"));
  });
});
