import io, { Socket } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/user.error";
import { IUserJwtPayload } from "../interface/user.interface";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import UserService from "./user.service";
import {
  CreateMessageDTO,
  DeleteMessageDTO,
  UpdateMessageDTO,
} from "../dto/message.dto";

export default class SocketService {
  public io: io.Server;
  private httpServer: http.Server;
  private userService: UserService;

  constructor(
    httpServer: http.Server,
    userService: UserService,
    socketServerOptions?: io.ServerOptions
  ) {
    this.httpServer = httpServer;
    this.userService = userService;

    this.io = new io.Server(this.httpServer, socketServerOptions);
    this.registerEvents();
  }

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
  addSocketToChatRoom(socket: Socket, chatId: number) {
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
  private authorizeSocket(socket: CustomSocket, next: any) {
    if (socket.handshake.query && socket.handshake.query.token) {
      const token = String(socket.handshake.query.token);

      try {
        const user = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as IUserJwtPayload;

        socket.userId = user.userId;
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
    const user = await this.userService.findUserById(socket.userId!);

    if (!user) {
      socket.userId = undefined;
      return new AuthenticationError();
    }

    let chat: any;
    for (chat in user.chats) {
      socket.join(`chat:${chat.id}`);
    }
  }

  // TODO
  private async onMessage(socket: CustomSocket, message: CreateMessageDTO) {}

  // TODO
  private async onMessageUpdate(
    socket: CustomSocket,
    message: UpdateMessageDTO
  ) {}

  // TODO
  private async onMessageDelete(
    socket: CustomSocket,
    message: DeleteMessageDTO
  ) {}

  private registerEvents() {
    // Socket authorization
    this.io.use(this.authorizeSocket);

    // Event handling
    this.io.on("connection", (socket: CustomSocket) => {
      this.addSocketToChatRoomsOnConnect(socket);

      socket.on("message", this.onMessage);
      socket.on("updateMessage", this.onMessageUpdate);
      socket.on("deleteMessage", this.onMessageDelete);
    });
  }
}

interface CustomSocket extends Socket<DefaultEventsMap, DefaultEventsMap> {
  userId?: number;
}
