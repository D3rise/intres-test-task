"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var server_service_1 = __importDefault(require("./service/server.service"));
var path_1 = __importDefault(require("path"));
if (process.env.NODE_ENV == "development") {
    dotenv_1.default.config({ path: path_1.default.join(__dirname, "..", "development.env") });
}
var PORT = Number(process.env.PORT) || 3000;
var HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
var app = new server_service_1.default({
    type: "postgres",
    url: process.env.DB_URL,
    entities: [path_1.default.join(__dirname, "entity", "*.ts")],
    synchronize: process.env.NODE_ENV == "development",
}, {
    url: process.env.REDIS_URL,
}, {
    port: PORT,
    hostname: HOSTNAME,
});
app.once("ready", function () {
    app.Logger.info("App is ready to receive requests!");
});
