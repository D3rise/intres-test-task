import { ConnectionOptions } from "typeorm";
import { ClientOpts } from "redis";
import Database from "./db.service";
import Redis from "./redis.service";
import { Logger } from "tslog";
import http from "http";
import express from "express";

export default class HttpServer {
  public DB: Database;
  public Redis: Redis;
  public Logger: Logger;
  public server: http.Server;

  private app: express.Express;
  private serverOptions: ServerOptions;

  constructor(
    dbOptions: ConnectionOptions,
    redisOptions: ClientOpts,
    serverOptions: ServerOptions
  ) {
    // Setup logger
    this.Logger = new Logger();

    // Setup server config
    this.serverOptions = serverOptions;

    // Setup database connections
    this.DB = new Database();
    this.Redis = new Redis(redisOptions);

    // Setup http server
    this.app = express();
    this.server = http.createServer(this.app);

    // Connect to DB and Redis (consistently)
    this.DB.connect(dbOptions).then(() => {
      this.Redis.once("ready", this.listen);
    });
  }

  private listen() {
    const PORT = this.serverOptions.port;
    const HOSTNAME = this.serverOptions.hostname;

    this.server.listen(PORT, HOSTNAME);
    this.Logger.info(`HTTP server now listening on ${HOSTNAME}:${PORT}`);
  }
}

interface ServerOptions {
  port: number;
  hostname?: string;
}
