"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_service_1 = __importDefault(require("./db.service"));
var redis_service_1 = __importDefault(require("./redis.service"));
var tslog_1 = require("tslog");
var http_1 = __importDefault(require("http"));
var express_1 = __importDefault(require("express"));
var socket_service_1 = __importDefault(require("./socket.service"));
var util_1 = require("util");
var events_1 = __importDefault(require("events"));
var HttpServer = /** @class */ (function (_super) {
    __extends(HttpServer, _super);
    function HttpServer(dbOptions, redisOptions, serverOptions, socketServerOptions) {
        var _this = _super.call(this) || this;
        // Setup logger
        _this.Logger = new tslog_1.Logger();
        _this.Logger.info("Server is starting...");
        // Setup server config
        _this.serverOptions = serverOptions;
        // Setup database connections
        _this.DB = new db_service_1.default();
        _this.Redis = new redis_service_1.default(redisOptions);
        _this.Redis.client.once("ready", function () {
            _this.Logger.info("Connected to Redis");
        });
        // Setup http server
        _this.app = express_1.default();
        _this.Server = http_1.default.createServer(_this.app);
        // Setup socket server
        _this.SocketServer = new socket_service_1.default(_this, socketServerOptions);
        // Connect to DB
        _this.DB.connect(dbOptions).then(function () {
            _this.Logger.info("Connected to DB");
            _this.listen();
        });
        return _this;
    }
    HttpServer.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var asyncQuit, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.DB.getConnection().close()];
                    case 1:
                        _a.sent();
                        this.Logger.info("Closed connection to DB");
                        asyncQuit = util_1.promisify(this.Redis.client.quit).bind(this.Redis.client);
                        return [4 /*yield*/, asyncQuit()];
                    case 2:
                        _a.sent();
                        this.Logger.info("Closed connection to Redis");
                        this.SocketServer.close();
                        this.Logger.info("Closed socket server");
                        this.Server.close();
                        this.Logger.info("Closed HTTP server");
                        return [2 /*return*/];
                    case 3:
                        e_1 = _a.sent();
                        this.Logger.fatal(e_1);
                        return [2 /*return*/, e_1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    HttpServer.prototype.listen = function () {
        var PORT = this.serverOptions.port;
        var HOSTNAME = this.serverOptions.hostname;
        this.Server.listen(PORT, HOSTNAME);
        this.Logger.info("HTTP server now listening on " + HOSTNAME + ":" + PORT);
        this.emit("ready");
    };
    return HttpServer;
}(events_1.default));
exports.default = HttpServer;
