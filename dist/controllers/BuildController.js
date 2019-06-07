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
/**
 * @module Build
 */
const serendip_utility_1 = require("serendip-utility");
const fs = require("fs-extra");
const log_1 = require("../log");
/**
 * This controller is responsible for build endpoints
 */
class BuildController {
    static checkQueueWithUid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemPath = `./queue/${req.query.uid}.json`;
            if (yield fs.pathExists(itemPath)) {
                res.json(yield fs.readJSON(itemPath));
            }
            else {
                res.sendStatus(404);
                res.end();
            }
        });
    }
    static buildWithUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.url) {
                res.status(400);
                res.end();
            }
            const appName = req.body.name ||
                req.body.url
                    .replace("https://", "")
                    .replace("http://", "")
                    .replace(/\W/g, " ");
            const uid = serendip_utility_1.text.randomAsciiString(12);
            let options = {
                uid,
                urls: [req.body.url],
                directory: `./temp/${uid}/www`,
                appName: appName,
                icon: req.body.icon,
                ip: req.ip,
                recursive: true,
                maxRecursiveDepth: req.body.maxRecursiveDepth || 3,
                requestConcurrency: req.body.requestConcurrency || 32
            };
            log_1.Log.info("build request", options);
            yield fs.ensureDir("./queue");
            yield fs.writeJSON("./queue/" + uid + ".json", options);
            res.json(options);
            //download whole website
            //auth user in phonegap build with token
        });
    }
}
exports.BuildController = BuildController;
