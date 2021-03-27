import io from "socket.io";
import HttpServer from "./server.service";

export default class SocketServer {
  public io: io.Server;
  private httpServer: HttpServer;

  constructor(httpServer: HttpServer, socketServerOptions?: io.ServerOptions) {
    this.io = new io.Server(httpServer.Server, socketServerOptions);
    this.httpServer = httpServer;
    this.httpServer.Logger.info(`Socket Server now listening`);
  }

  public close() {
    this.io.close();
  }
}
