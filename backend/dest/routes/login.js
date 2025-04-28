"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const login_1 = require("../middlewares/login");
const loginRoutes = async (server) => {
    server.post('/', {
        preValidation: [login_1.verifyBodyExistance],
        handler: async (req, res) => {
            return res.status(200).send({ message: "getting from login" });
        }
    });
};
exports.default = loginRoutes;
