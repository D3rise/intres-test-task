import {
  Connection,
  ConnectionOptions,
  createConnection,
  EntityManager,
  getManager,
} from "typeorm";

export default class Database {
  private connection: Connection;
  public Manager: EntityManager;

  constructor() {}

  getConnection(): Connection {
    if (!this.connection || !this.connection.isConnected) {
      throw new Error("not connected to db!");
    }
    return this.connection;
  }

  connect(options: ConnectionOptions) {
    return createConnection(options).then((conn) => {
      this.connection = conn;
      this.Manager = getManager();
    });
  }
}
