import {
  CreateMessageDTO,
  DeleteMessageDTO,
  UpdateMessageDTO,
} from "../dto/message.dto";
import RedisService from "./redis.service";
import { v4 as uuidv4 } from "uuid";
import { IMessage } from "../interface/message.interface";
import { NotFoundError } from "../error/general.error";

export default class MessageService {
  redis: RedisService;

  constructor(redis: RedisService) {
    this.redis = redis;
  }

  /**
   * Create new message
   * @param message New message data
   * @param authorId ID of message author
   * @returns Newly created message
   */
  async createMessage(message: CreateMessageDTO, authorId: number) {
    const messageObject: IMessage = {
      id: uuidv4(),
      chatId: message.chatId,
      authorId: authorId,
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

  /**
   * Edits message
   * @param message Message update data
   * @returns Newly updated message
   */
  async editMessage(message: UpdateMessageDTO) {
    const chatId = message.chatId;
    const messages: Array<IMessage> = await this.getChatMessages(chatId);

    for (let msg of messages) {
      if (msg.id === message.messageId) {
        msg.content = message.newMessage;
        msg.updatedAt = new Date().getTime();

        await this.saveChatMessages(chatId, messages);
        return msg;
      }
    }

    throw new NotFoundError("Message");
  }

  /**
   * Deletes message
   * @param message Message delete data (DTO)
   * @param authorId ID of message author
   * @returns Deleted message
   */
  async deleteMessage(message: DeleteMessageDTO, authorId: number) {
    const { chatId, messageId } = message;
    const messages = await this.getChatMessages(chatId);

    for (let [i, msg] of messages.entries()) {
      if (msg.id === messageId && msg.authorId === authorId) {
        let deletedMessage = messages.splice(i, 1)[0];
        await this.saveChatMessages(chatId, messages);

        return deletedMessage;
      }
    }

    throw new NotFoundError("Message");
  }

  /**
   * Get message from chat
   * @param messageId ID of message
   * @param chatId ID of chat that message is in
   * @returns Founded message of undefined
   */
  async getMessage(messageId: string, chatId: number) {
    const messages: Array<IMessage> = await this.getChatMessages(chatId);

    for (let msg of messages) {
      if (msg.id === messageId) {
        return msg;
      }
    }
    return undefined;
  }

  /**
   * Get all messages from chat
   * @param chatId ID of chat
   * @returns Messages from this chat
   */
  async getChatMessages(chatId: number): Promise<Array<IMessage>> {
    const messages = await this.redis.get(`chat:${chatId}`);

    // if chat is found and messages exist
    if (messages) {
      return JSON.parse(messages);
    }

    throw new NotFoundError("Chat");
  }

  /**
   * Saves messages in chat
   * @param chatId ID of chat
   * @param messages Messages to save in chat
   */
  async saveChatMessages(chatId: number, messages: Array<IMessage>) {
    const messagesJSON = JSON.stringify(messages);
    await this.redis.set(`chat:${chatId}`, messagesJSON);
  }
}
