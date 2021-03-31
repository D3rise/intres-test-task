import io, { Socket } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/user.error";
import { IUserJwtPayload } from "../interface/user.interface";
import { ISocket as CustomSocket } from "../interface/socket.interface";
import UserService from "./user.service";
import {
  CreateMessageDTO,
  DeleteMessageDTO,
  UpdateMessageDTO,
} from "../dto/message.dto";
import { IMessage } from "../interface/message.interface";
import MessageService from "./message.service";
import { User } from "../entity/User.entity";

export default class SocketService {
  public io: io.Server;
  private httpServer: http.Server;
  private userService: UserService;
  private messageService: MessageService;

  constructor(
    httpServer: http.Server,
    userService: UserService,
    messageService: MessageService,
    socketServerOptions?: io.ServerOptions
  ) {
    this.httpServer = httpServer;
    this.userService = userService;
    this.messageService = messageService;

    this.io = new io.Server(this.httpServer, socketServerOptions);
    this.registerEvents();
  }

  /**
   * Closes Socket server
   */
  close() {
    this.io.close();
  }

  /**
   * Get room of chat
   * @param chatId ID of desired chat
   * @returns Room of chat
   */
  toChat(chatId: number) {
    return this.io.to(`chat:${chatId}`);
  }

  /**
   * Add user (socket) to the chat socketroom
   * @param socket User's socket
   * @param chatId ID of chat to add member to
   */
  addSocketToChatRoom(socket: CustomSocket, chatId: number) {
    socket.join(`chat:${chatId}`);
  }

  /**
   * Remove socket from chat room
   * @param socket Socket to remove
   * @param chatId ID of chat
   */
  removeSocketFromChatRoom(socket: CustomSocket, chatId: number) {
    socket.leave(`chat:${chatId}`);
  }

  /**
   * Authorizes socket on connect
   */
  private async authorizeSocket(socket: CustomSocket, next: any) {
    if (socket.handshake.query && socket.handshake.query.token) {
      const token = String(socket.handshake.query.token);

      try {
        const user = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as IUserJwtPayload;

        socket.userId = user.userId;
        next();
      } catch (e) {
        next(new AuthenticationError());
      }
    } else {
      next(new Error("Authentication error"));
    }
  }

  /**
   * Joins socket to all the socket rooms of chats that it is in
   */
  private async addSocketToChatRoomsOnConnect(socket: CustomSocket) {
    const user = await this.userService.findUserById(socket.userId!, {
      relations: ["chats"],
    });

    let chat: any;
    for (chat in user!.chats) {
      socket.join(`chat:${chat.id}`);
    }
  }

  /**
   * Sends all messages from all user's chats to socket
   */
  private async sendAllMessagesToSocket(socket: CustomSocket) {
    const user = await this.userService.findUserById(socket.userId!, {
      relations: ["chats"],
    });

    const messages: Map<string, IMessage[]> = new Map<string, IMessage[]>();

    let chat: any;
    for (chat in user!.chats) {
      const chatMessages = await this.messageService.getChatMessages(chat.id);
      messages.set(chat.id, chatMessages);
    }

    socket.emit("sendMessages", { messages });
  }

  /**
   * message event handler, sends message to chat
   * @param socket Socket that sended the request to send message
   * @param message New message data (DTO)
   */
  private async onMessage(socket: CustomSocket, message: CreateMessageDTO) {
    const { userId } = socket;

    if (!userId) {
      socket.userId = undefined;
      throw new AuthenticationError();
    }

    let newMessage = await this.messageService.createMessage(message, userId);
    this.toChat(message.chatId).emit("message", { message: newMessage });
  }

  /**
   * messageUpdate event handler, updates user message
   * @param socket Socket that sended request to update message
   * @param message Message update data (DTO)
   */
  private async onMessageUpdate(
    socket: CustomSocket,
    message: UpdateMessageDTO
  ) {
    const { userId } = socket;

    if (!userId) {
      socket.userId = undefined;
      throw new AuthenticationError();
    }

    try {
      let updatedMessage = await this.messageService.editMessage(message);
      this.toChat(message.chatId).emit("messageUpdate", {
        message: updatedMessage,
      });
    } catch (e) {
      socket.emit("error", { error: e.text });
    }
  }

  /**
   * messageDelete event handler, deletes user message
   * @param socket Socket that sended request to delete message
   * @param message Message delete data (DTO)
   */
  private async onMessageDelete(
    socket: CustomSocket,
    message: DeleteMessageDTO
  ) {
    const { userId } = socket;

    try {
      let deletedMessage = await this.messageService.deleteMessage(
        message,
        userId!
      );
      this.toChat(message.chatId).emit("messageDelete", {
        message: deletedMessage,
      });
    } catch (e) {
      socket.emit("error", { error: e.text });
    }
  }

  /**
   * Registers socket events
   */
  private registerEvents() {
    // Socket authorization
    this.io
      .use(this.authorizeSocket)
      .on("connection", (socket: CustomSocket) => {
        this.addSocketToChatRoomsOnConnect(socket);
        this.sendAllMessagesToSocket(socket);

        socket.on("message", this.onMessage);
        socket.on("updateMessage", this.onMessageUpdate);
        socket.on("deleteMessage", this.onMessageDelete);
      });
  }
}
