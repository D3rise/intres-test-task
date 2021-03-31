import { CreateMessageDTO, UpdateMessageDTO } from "../dto/message.dto";
import RedisService from "./redis.service";
import { v4 as uuidv4 } from "uuid";
import { IMessage } from "../interface/message.interface";
import { NotFoundError } from "../error/general.error";

export default class MessageService {
  redis: RedisService;

  constructor(redis: RedisService) {
    this.redis = redis;
  }

  async createMessage(message: CreateMessageDTO, authorId: number) {
    const messageObject: IMessage = {
      id: uuidv4(),
      author: authorId,
      content: message.message,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };
    const chatId = message.chatId;

    const messages = await this.getChatMessages(chatId);
    messages.push(messageObject);
    await this.saveChatMessages(chatId, messages);

    return messageObject;
  }

  async editMessage(message: UpdateMessageDTO) {
    const chatId = message.chatId;
    const messages: Array<IMessage> = await this.getChatMessages(chatId);

    for (let msg of messages) {
      if (msg.id === message.messageId) {
        msg.content = message.newMessage;
        msg.updatedAt = new Date().getTime();

        await this.saveChatMessages(chatId, messages);
        return message;
      }
    }

    throw new NotFoundError("Message");
  }

  async deleteMessage(messageId: string, chatId: number) {
    const messages = await this.getChatMessages(chatId);

    for (let [i, msg] of messages.entries()) {
      if (msg.id === messageId) {
        let deletedMessage = messages.splice(i, 1)[0];
        await this.saveChatMessages(chatId, messages);

        return deletedMessage;
      }
    }

    throw new NotFoundError("Message");
  }

  async getMessage(messageId: string, chatId: number) {
    const messages: Array<IMessage> = await this.getChatMessages(chatId);

    for (let msg of messages) {
      if (msg.id === messageId) {
        return msg;
      }
    }
  }

  async getChatMessages(chatId: number): Promise<Array<IMessage>> {
    const messages = await this.redis.get(`chat:${chatId}`);

    // if chat is found and messages exist
    if (messages) {
      return JSON.parse(messages);
    }

    throw new NotFoundError("Chat");
  }

  async saveChatMessages(chatId: number, messages: Array<IMessage>) {
    const messagesJSON = JSON.stringify(messages);
    await this.redis.set(`chat:${chatId}`, messagesJSON);
  }
}
