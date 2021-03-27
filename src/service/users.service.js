"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt_1 = __importDefault(require("bcrypt"));
var User_entity_1 = require("../entity/User.entity");
var UserService = /** @class */ (function () {
    function UserService(db) {
        this.db = db;
        this.userRepository = this.db.Manager.getRepository(User_entity_1.User);
    }
    /**
     * Creates new user with specified username and password
     * @param username Username of new user
     * @param password Password of new user
     * @returns Newly created user
     */
    UserService.prototype.addUser = function (username, password) {
        if (this.usernameExists(username)) {
            throw new Error("user already exists");
        }
        var passwordHash = bcrypt_1.default.hashSync(password, 10);
        var newUser = this.userRepository.create({ username: username, passwordHash: passwordHash });
        return newUser;
    };
    /**
     * Checks if user with specified username actually exists
     * @param username Username of user
     * @returns True, if user exists and false if doesn't
     */
    UserService.prototype.usernameExists = function (username) {
        var user = this.userRepository.findOne({ username: username });
        return !!user;
    };
    return UserService;
}());
exports.default = UserService;
