import MessageService from "../../src/service/message.service";
import RedisService from "../../src/service/redis.service";
import dotenv from "dotenv";
import path from "path";
import { CreateMessageDTO } from "../../src/dto/message.dto";
import { IMessage } from "../../src/interface/message.interface";
import ChatService from "../../src/service/chat.service";
import DatabaseService from "../../src/service/db.service";
import UserService from "../../src/service/user.service";
import { User } from "../../src/entity/User.entity";
import { NotFoundError } from "../../src/error/general.error";

dotenv.config({
  path: path.join(__dirname, "..", "..", "development.env"),
});

let chatService: ChatService;
let userService: UserService;
let db: DatabaseService;
let redis: RedisService;
let messageService: MessageService;
let testUser: User;

beforeEach(async (done) => {
  db = new DatabaseService();

  db.connect({
    type: "postgres",
    url: process.env.DB_URL,
    entities: [
      path.join(__dirname, "..", "..", "src", "entity", "*.entity.ts"),
    ],
    synchronize: true,
    dropSchema: true,
  }).then(async () => {
    redis = new RedisService({
      url: process.env.REDIS_URL,
    });

    userService = new UserService(db);
    chatService = new ChatService(db, redis);
    messageService = new MessageService(redis);

    testUser = await userService.addUser({
      username: "Van",
      password: "theGymIsMyHeaven",
    });
    done();
  });
});

afterEach(async () => {
  await db.getConnection().close();
  await redis.flushdb();
  await redis.quit();
});

describe("create/remove/update message functions", () => {
  it("should create and return new message", async () => {
    const chat = await chatService.createChat(
      {
        title: "The Gym",
      },
      testUser
    );
    const chatId = chat.id;

    let message: CreateMessageDTO | IMessage = {
      message: "Woah! Wrong door!",
      chatId,
    };

    message = await messageService.createMessage(message, testUser.id);
    const messageRecord = await messageService.getMessage(message.id, chatId);

    expect(messageRecord).toHaveProperty("content", "Woah! Wrong door!");
  });

  it('should not create message and return NotFound("Chat") error', async () => {
    let message: CreateMessageDTO | Promise<IMessage> = {
      message: "What did you say to 'bout my mama?",
      chatId: 6,
    };

    message = messageService.createMessage(message, testUser.id);
    expect(message).rejects.toThrow(new NotFoundError("Chat"));
  });

  it("should delete message from chat", async () => {
    const chat = await chatService.createChat(
      {
        title: "Wrong door",
      },
      testUser
    );
    const chatId = chat.id;

    let message: CreateMessageDTO | IMessage | undefined = {
      message: "Woah! Wrong gym!",
      chatId,
    };

    message = await messageService.createMessage(message, testUser.id);

    const deletedMessage = await messageService.deleteMessage(
      {
        chatId: message.chatId,
        messageId: message.id,
      },
      testUser.id
    );
    message = await messageService.getMessage(message.id, chatId);

    expect(deletedMessage).toHaveProperty("content", "Woah! Wrong gym!");
    expect(message).toBeUndefined();
  });

  it("shouldn't delete message and throw NotFoundError", async () => {
    const chat = await chatService.createChat(
      {
        title: "City 17",
      },
      testUser
    );

    const chatId = chat.id;

    const deletedMessage = messageService.deleteMessage(
      {
        chatId,
        messageId: "314159265",
      },
      testUser.id
    );

    expect(deletedMessage).rejects.toThrow(new NotFoundError("Message"));
  });

  it("should update and return message", async () => {
    const chat = await chatService.createChat(
      {
        title: "NASA",
      },
      testUser
    );
    const chatId = chat.id;

    const message = await messageService.createMessage(
      {
        chatId,
        message: "Ave Perseverance!",
      },
      testUser.id
    );

    const updatedMessage = await messageService.editMessage({
      chatId,
      messageId: message.id,
      newMessage: "Ave Ingenuity!",
    });

    expect(updatedMessage).toHaveProperty("content", "Ave Ingenuity!");
  });

  it("shouldn't update message and return NotFound error", async () => {
    const chat = await chatService.createChat(
      {
        title: "RosCosmos",
      },
      testUser
    );
    const chatId = chat.id;

    const updatedMessage = messageService.editMessage({
      chatId,
      messageId: "7297352",
      newMessage: "ID of this message is Fine-structure constant!",
    });
    expect(updatedMessage).rejects.toThrow(new NotFoundError("Message"));
  });
});
