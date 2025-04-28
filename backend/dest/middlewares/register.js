"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.verifyUsername = void 0;
const USERNAME_REGEX = /^(?=.*[A-Za-z])[A-Za-z_]{2,12}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;
const verifyUsername = async (req, res) => {
    const { username } = req === null || req === void 0 ? void 0 : req.body;
    if (!username || !username.match(USERNAME_REGEX)) {
        res.status(400).send({
            message: "username must be 2–12 characters long, use only letters and underscores, and contain at least one letter"
        });
    }
};
exports.verifyUsername = verifyUsername;
const verifyPassword = async (req, res) => {
    const { password } = req === null || req === void 0 ? void 0 : req.body;
    if (!password || !password.match(PASSWORD_REGEX)) {
        res.status(400).send({
            message: "password must be 8-64 characters long, use at least one lowercase letter, one uppercase letter, a digit, and a special character"
        });
    }
};
exports.verifyPassword = verifyPassword;
