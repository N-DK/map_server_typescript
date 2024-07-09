"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const config_1 = require("./config/config");
const app = (0, express_1.default)();
app.get('/', (req, res, next) => {
    res.send('Hello World!');
});
const server = http_1.default.createServer(app);
server.listen(config_1.SERVER.PORT, () => {
    console.log(`Server is running on http://${config_1.SERVER.HOSTNAME}:${config_1.SERVER.PORT}`);
});
