"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBodyExistance = void 0;
const verifyBodyExistance = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).send({
            message: "No body found"
        });
    }
};
exports.verifyBodyExistance = verifyBodyExistance;
