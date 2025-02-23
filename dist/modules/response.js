"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (res, success, data, message) => {
    return res.send({ success, data, message });
};
