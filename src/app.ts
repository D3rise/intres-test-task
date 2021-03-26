import dotenv from "dotenv";
import Server from "./service/server.service";
import path from "path";

if (process.env.NODE_ENV == "development") {
  dotenv.config({ path: path.join(__dirname, "..", "development.env") });
}

const PORT = Number(process.env.PORT) || 3000;
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

const app = new Server(
  {
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.NODE_ENV == "development",
  },
  {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
  {
    port: PORT,
    hostname: HOSTNAME,
  }
);
