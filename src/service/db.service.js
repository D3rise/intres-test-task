"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var Database = /** @class */ (function () {
    function Database() {
    }
    Database.prototype.getConnection = function () {
        if (!this.connection || !this.connection.isConnected) {
            throw new Error("not connected to db!");
        }
        return this.connection;
    };
    Database.prototype.connect = function (options) {
        var _this = this;
        return typeorm_1.createConnection(options).then(function (conn) {
            _this.connection = conn;
            _this.Manager = typeorm_1.getManager();
        });
    };
    return Database;
}());
exports.default = Database;
