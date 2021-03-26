import { Connection, ConnectionOptions, createConnection } from "typeorm";

export default class Database {
  private connection: Connection | null;

  constructor() {
    this.connection = null;
  }

  connect(options: ConnectionOptions) {
    return createConnection(options).then((conn) => {
      this.connection = conn;
    });
  }
}
