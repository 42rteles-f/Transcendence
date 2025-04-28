"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = Router;
exports.Get = Get;
exports.Post = Post;
const __1 = require("..");
const routes = new Map();
function Router(prefix) {
    return function (constructor) {
        if (!prefix)
            prefix = constructor.name.toLowerCase().replace("routes", "");
        const register = async (fastify, options) => {
            for (const data of routes.get(constructor.name) || []) {
                console.log(`/${prefix}/${data.url}`);
                fastify[data.method](`/${data.url}`, {
                    onRequest: data.auth ? [fastify.authenticate] : undefined,
                    handler: data.action
                });
            }
        };
        __1.server.register(register, { prefix: `/${prefix}` });
    };
}
function Get(url, auth = true) {
    return function (target, propertyKey, descriptor) {
        var _a;
        const targetName = target.constructor.name;
        if (!url)
            url = propertyKey.toLowerCase();
        if (routes.has(targetName)) {
            (_a = routes.get(targetName)) === null || _a === void 0 ? void 0 : _a.push({
                url,
                method: "get",
                action: descriptor.value,
                auth
            });
        }
        else {
            routes.set(targetName, [{
                    url,
                    method: "get",
                    action: descriptor.value,
                    auth
                }]);
        }
        return descriptor;
    };
}
function Post(url, auth = true) {
    return function (target, propertyKey, descriptor) {
        var _a;
        const targetName = target.constructor.name;
        if (!url)
            url = propertyKey.toLowerCase();
        if (routes.has(targetName)) {
            (_a = routes.get(targetName)) === null || _a === void 0 ? void 0 : _a.push({
                url,
                method: "post",
                action: descriptor.value,
                auth
            });
        }
        else {
            routes.set(targetName, [{
                    url,
                    method: "get",
                    action: descriptor.value,
                    auth
                }]);
        }
        return descriptor;
    };
}
