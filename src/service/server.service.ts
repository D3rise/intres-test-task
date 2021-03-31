import { ConnectionOptions } from "typeorm";
import { ClientOpts } from "redis";
import Database from "./db.service";
import RedisService from "./redis.service";
import { Logger } from "tslog";
import http from "http";
import express from "express";
import io from "socket.io";
import { promisify } from "util";
import EventEmitter from "events";
import SocketService from "./socket.service";
import UserService from "./user.service";
import ChatService from "./chat.service";
import MessageService from "./message.service";
import bodyParser from "body-parser";

export default class HttpService extends EventEmitter {
  public DB: Database;
  public Redis: RedisService;
  public Logger: Logger;
  public Server: http.Server;

  public SocketService: SocketService;
  public UserService: UserService;
  public ChatService: ChatService;
  public MessageService: MessageService;

  private app: express.Express;
  private serverOptions: ServerOptions;

  constructor(
    dbOptions: ConnectionOptions,
    redisOptions: ClientOpts,
    serverOptions: ServerOptions,
    socketServerOptions?: io.ServerOptions
  ) {
    super();

    // Setup logger
    this.Logger = HttpService.logger;
    this.Logger.info("Server is starting...");

    // Setup server config
    this.serverOptions = serverOptions;

    // Setup database connections
    this.setupDatabaseConnections(redisOptions);

    // Setup http server
    this.app = express();
    this.Server = http.createServer(this.app);

    // Connect to DB
    this.DB.connect(dbOptions).then(() => {
      this.Logger.info("Connected to DB");
      this.setupServices(socketServerOptions);
      this.listen();
    });
  }

  public async close() {
    try {
      await this.DB.getConnection().close();
      this.Logger.info("Closed connection to DB");

      await this.Redis.quit();
      this.Logger.info("Closed connection to Redis");

      this.SocketService.close();
      this.Logger.info("Closed socket server");

      this.Server.close();
      this.Logger.info("Closed HTTP server");
      return;
    } catch (e) {
      this.Logger.fatal(e);
      return e;
    }
  }

  private listen() {
    const PORT = this.serverOptions.port;
    const HOSTNAME = this.serverOptions.hostname;

    this.setupMiddlewares();
    this.setupRoutes();

    this.Server.listen(PORT, HOSTNAME);
    this.Logger.info(`HTTP server now listening on ${HOSTNAME}:${PORT}`);

    this.emit("ready");
  }

  private setupMiddlewares() {
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
  }

  // TODO
  private setupRoutes() {}

  private setupDatabaseConnections(redisOptions: ClientOpts) {
    this.DB = new Database();
    this.Redis = new RedisService(redisOptions);
    this.Redis.client.once("ready", () => {
      this.Logger.info("Connected to Redis");
    });
  }

  private setupServices(socketServerOptions?: io.ServerOptions) {
    this.SocketService = new SocketService(
      this.Server,
      this.UserService,
      this.MessageService,
      socketServerOptions
    );

    this.UserService = new UserService(this.DB);
    this.ChatService = new ChatService(this.DB, this.Redis);
    this.MessageService = new MessageService(this.Redis);
  }

  static get logger(): Logger {
    return new Logger({ type: "pretty" });
  }
}

interface ServerOptions {
  port: number;
  hostname?: string;
}
