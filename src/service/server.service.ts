import { ConnectionOptions } from "typeorm";
import { ClientOpts } from "redis";
import Database from "./db.service";
import Redis from "./redis.service";
import { Logger } from "tslog";
import http from "http";
import express from "express";
import io from "socket.io";
import SocketServer from "./socket.service";
import { promisify } from "util";
import EventEmitter from "events";

export default class HttpServer extends EventEmitter {
  public DB: Database;
  public Redis: Redis;
  public Logger: Logger;
  public Server: http.Server;
  public SocketServer: SocketServer;

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
    this.Logger = new Logger();
    this.Logger.info("Server is starting...");

    // Setup server config
    this.serverOptions = serverOptions;

    // Setup database connections
    this.DB = new Database();
    this.Redis = new Redis(redisOptions);
    this.Redis.client.once("ready", () => {
      this.Logger.info("Connected to Redis");
    });

    // Setup http server
    this.app = express();
    this.Server = http.createServer(this.app);

    // Setup socket server
    this.SocketServer = new SocketServer(this, socketServerOptions);

    // Connect to DB
    this.DB.connect(dbOptions).then(() => {
      this.Logger.info("Connected to DB");
      this.listen();
    });
  }

  public async close() {
    try {
      await this.DB.getConnection().close();
      this.Logger.info("Closed connection to DB");

      const asyncQuit = promisify(this.Redis.client.quit).bind(
        this.Redis.client
      );
      await asyncQuit();
      this.Logger.info("Closed connection to Redis");

      this.SocketServer.close();
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

    this.Server.listen(PORT, HOSTNAME);
    this.Logger.info(`HTTP server now listening on ${HOSTNAME}:${PORT}`);

    this.emit("ready");
  }
}

interface ServerOptions {
  port: number;
  hostname?: string;
}
