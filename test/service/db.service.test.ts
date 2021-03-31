import path from "path";
import dotenv from "dotenv";
import { Connection } from "typeorm";
import Database from "../../src/service/db.service";

let db: Database;

dotenv.config({
  path: path.join(__dirname, "..", "..", "development.env"),
});

beforeEach(async (done) => {
  db = new Database();
  db.connect({
    type: "postgres",
    url: process.env.DB_URL,
    entities: [
      path.join(__dirname, "..", "..", "src", "entity", "*.entity.ts"),
    ],
    dropSchema: true,
    synchronize: true,
  }).then(done);
});

afterEach(() => {
  try {
    db.getConnection().close();
  } catch (e) {
    return;
  }
});

describe("db connection", () => {
  let connection: Connection;

  beforeEach(() => {
    connection = db.getConnection();
  });

  it("should be connected", () => {
    expect(connection.isConnected).toBeTruthy();
  });

  it("should throw error that it is not connected", async (done) => {
    connection.close().then(() => {
      expect(db.getConnection).toThrow();
      done();
    });
  });
});
