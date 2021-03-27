"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var SocketServer = /** @class */ (function () {
    function SocketServer(httpServer, socketServerOptions) {
        this.io = new socket_io_1.default.Server(httpServer.Server, socketServerOptions);
        this.httpServer = httpServer;
        this.httpServer.Logger.info("Socket Server now listening");
    }
    SocketServer.prototype.close = function () {
        this.io.close();
    };
    return SocketServer;
}());
exports.default = SocketServer;
