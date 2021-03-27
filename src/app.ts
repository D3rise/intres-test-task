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
    url: process.env.DB_URL,
    entities: [path.join(__dirname, "entity", "*.ts")],
    synchronize: process.env.NODE_ENV == "development",
  },
  {
    url: process.env.REDIS_URL,
  },
  {
    port: PORT,
    hostname: HOSTNAME,
  }
);

app.once("ready", () => {
  app.Logger.info("App is ready to receive requests!");
});
