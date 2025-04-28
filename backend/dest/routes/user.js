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
const _1 = require(".");
// server.register(require('./routes/user'), { prefix: '/user' })
let UserRoutes = class UserRoutes {
    profile(req, res) {
        console.log("user/profile");
        res.status(200).send({ message: "getting from login" });
    }
    updateProfile(req, res) {
        console.log("user/update");
    }
};
__decorate([
    (0, _1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserRoutes.prototype, "profile", null);
__decorate([
    (0, _1.Post)("update"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserRoutes.prototype, "updateProfile", null);
UserRoutes = __decorate([
    (0, _1.Router)()
], UserRoutes);
;
