import io from "socket.io";
import http from "http";

export default class SocketService {
  public io: io.Server;
  private httpServer: http.Server;

  constructor(httpServer: http.Server, socketServerOptions?: io.ServerOptions) {
    this.httpServer = httpServer;
    this.io = new io.Server(this.httpServer, socketServerOptions);
  }

  public close() {
    this.io.close();
  }
}
