"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let DB = [];
exports.default = {
    saveNewUser: (user) => {
        DB.push(user);
    },
    getUsers: () => {
        return DB;
    },
    getUser: (id) => {
        return DB.find((user) => user.userID === id);
    },
    deleteUser: (id) => {
        DB = DB.filter((user) => user.socketID !== id);
    },
};
