"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const util_1 = require("util");
const getPort = require("get-port");
function close(server) {
    return __awaiter(this, void 0, void 0, function* () {
        return util_1.promisify(server.close.bind(server))();
    });
}
function listen(app, port = 3000) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const server = app.listen(port, (err) => {
                if (err) {
                    return reject(err);
                }
                else {
                    return resolve(server);
                }
            });
        });
    });
}
const openServers = [];
afterEach(() => __awaiter(this, void 0, void 0, function* () {
    const toCLose = openServers.splice(0);
    return Promise.all(toCLose.map(close));
}));
function createHandler(handler) {
    return __awaiter(this, void 0, void 0, function* () {
        const port = yield getPort();
        const server = yield listen(http_1.createServer(handler), port);
        openServers.push(server);
        return {
            port
        };
    });
}
exports.createHandler = createHandler;
