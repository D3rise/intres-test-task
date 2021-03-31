import {
  DeleteResult,
  FindOneOptions,
  Repository,
  UpdateResult,
} from "typeorm";
import { CreateChatDTO, UpdateChatDTO } from "../dto/chat.dto";
import { Chat } from "../entity/Chat.entity";
import { User } from "../entity/User.entity";
import { NotFoundError } from "../error/general.error";
import Database from "./db.service";
import SocketService from "./socket.service";

/**
 * All needed methods to work with chats
 */
export default class ChatService {
  db: Database;
  chatRepository: Repository<Chat>;

  /**
   * Creates new chat service
   * @param db Desired database for ChatService to work with
   */
  constructor(db: Database) {
    this.db = db;
    this.chatRepository = db.Manager.getRepository(Chat);
  }

  /**
   * Add user to chat members
   * @param chatId ID of desired chat to add member to
   * @param user User to add to chat to
   * @returns Updated chat
   */
  async addMemberToChat(chatId: number, user: User): Promise<Chat> {
    const chat = await this.findChatById(chatId, { relations: ["members"] });
    if (!chat) {
      throw new NotFoundError("Chat");
    }

    chat.members = [user];
    return await this.chatRepository.save(chat);
  }

  /**
   * Remove user from chat members
   * @param chatId ID of chat
   * @param user Member ID
   * @returns Updated chat
   */
  async removeMemberFromChat(chatId: number, user: User): Promise<Chat> {
    const chat = await this.findChatById(chatId, { relations: ["members"] });
    if (!chat) {
      throw new NotFoundError("Chat");
    }

    chat.members = chat.members.filter(
      (chatMember) => chatMember.id !== user.id
    );
    return await this.chatRepository.save(chat);
  }

  /**
   * Creates new chat with specified parameters
   * @param newChatData Parameters to create chat with
   */
  async createChat(newChatData: CreateChatDTO, author: User): Promise<Chat> {
    const newChatObject = {
      ...newChatData,
      author,
    };
    const newChat = this.chatRepository.create(newChatObject);
    await this.chatRepository.save(newChat);

    return newChat;
  }

  /**
   * Updates chat with specified data
   * @param chatId ID of chat
   * @param newChatData New data to replace old data with
   * @returns Result of update operation
   */
  async updateChat(
    chatId: number,
    newChatData: UpdateChatDTO
  ): Promise<UpdateResult> {
    if (!(await this.findChatById(chatId))) {
      throw new NotFoundError("Chat");
    }

    return this.chatRepository.update(chatId, newChatData);
  }

  /**
   * Deletes specified chat
   * @param chatId ID of chat
   * @returns Result of delete operation
   */
  async deleteChat(chatId: number): Promise<DeleteResult> {
    if (!(await this.findChatById(chatId))) {
      throw new NotFoundError("Chat");
    }

    return this.chatRepository.delete(chatId);
  }

  /**
   * Find chat by ID
   * @param id
   * @returns
   */
  async findChatById(id: number, options?: FindOneOptions<Chat>) {
    return this.findChat({ id }, options);
  }

  /**
   * Tries to find chat with specified parameters
   * @param chat Parameters to search chat with
   * @returns Founded chat or undefined
   */
  private findChat(
    chat: Partial<Chat>,
    options?: FindOneOptions<Chat>
  ): Promise<Chat | undefined> {
    return this.chatRepository.findOne(chat, options);
  }
}
