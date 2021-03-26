import io from "socket.io";
import HttpServer from "./server.service";

export default class SocketServer {
  public io: io.Server;

  constructor(socketServerOptions: io.ServerOptions, httpServer: HttpServer) {
    this.io = new io.Server(httpServer.server, socketServerOptions);
  }
}
