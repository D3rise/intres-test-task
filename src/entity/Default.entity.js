"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var typeorm_1 = require("typeorm");
var Default = /** @class */ (function () {
    function Default() {
    }
    Default.prototype.updateUpdatedAt = function () {
        this.updatedAt = new Date();
    };
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Default.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", default: function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Default.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.Column({ default: null }),
        __metadata("design:type", Date)
    ], Default.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.AfterUpdate(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Default.prototype, "updateUpdatedAt", null);
    Default = __decorate([
        typeorm_1.Entity({ synchronize: false })
    ], Default);
    return Default;
}());
exports.Default = Default;
