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
const index_1 = require("../index");
function fetchUserByToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return token ? 'Johnny' : undefined;
    });
}
function withAuthentication(handler) {
    return (ctx) => __awaiter(this, void 0, void 0, function* () {
        const token = ctx.request.headers.get('authorization');
        const user = yield fetchUserByToken(token);
        if (!user) {
            return new index_1.Response('Get out!', { status: 401 });
        }
        return handler(Object.assign({}, ctx, { user }));
    });
}
exports.withAuthentication = withAuthentication;
function withServerTiming(handler) {
    return (ctx) => __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        const response = yield handler(ctx);
        const duration = Date.now() - start;
        response.headers.set('server-timing', `total;dur=${duration}`);
        return response;
    });
}
exports.withServerTiming = withServerTiming;
exports.default = index_1.serve(withServerTiming(withAuthentication(({ user }) => {
    return index_1.Response.json({ user });
})));
