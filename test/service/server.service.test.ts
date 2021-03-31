import HttpServer from "../../src/service/server.service";
import dotenv from "dotenv";
import path from "path";
import supertest from "supertest";

let server: HttpServer;

dotenv.config({
  path: path.join(__dirname, "..", "..", "development.env"),
});
const PORT = Number(process.env.PORT) || 3000;
const HOSTNAME = process.env.HOSTNAME;

beforeEach(async (done) => {
  server = new HttpServer(
    {
      type: "postgres",
      url: process.env.DB_URL,
      entities: [path.join(__dirname, "..", "..", "src", "entity", "*.ts")],
      synchronize: true,
      dropSchema: true,
    },
    {
      url: process.env.REDIS_URL,
    },
    {
      port: PORT,
      hostname: HOSTNAME,
    }
  );

  server.once("ready", done);
});

afterEach(async (done) => {
  server.close().then(done);
});

describe("http server", () => {
  it("should listen", async () => {
    await supertest(server.Server)
      .get("/")
      .then((response) => {
        expect(response).toBeDefined();
      });
  });
});
