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
const bodyParser = require("body-parser");
const cors = require("cors");
const Express = require("express");
const path = require("path");
const PhonegapService_1 = require("./services/PhonegapService");
const ScrapeService_1 = require("./services/ScrapeService");
const BuildController_1 = require("./controllers/BuildController");
const log_1 = require("./log");
const BuildService_1 = require("./services/BuildService");
class App {
    constructor() {
        /**
         * Instance of express
         */
        this.express = Express();
        this.express.use(bodyParser.urlencoded({ extended: false }));
        // parse application/json
        this.express.use(bodyParser.json());
        // CORS Middleware
        this.express.use(cors());
        // Set Static Folder
        this.express.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const reqStart = Date.now();
            yield next();
            const resTime = Date.now() - reqStart;
            if (!res.headersSent)
                res.header("X-Response-Time", `${resTime}ms`);
            log_1.Log.info(`[${req.method}] ${req.url} in ${resTime}ms | ${res.statusCode} ${res.statusMessage || ""} `);
        }));
        this.express.use(Express.static(path.join(__dirname, "..", "public")));
    }
    static bootstrap(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            App.instance = new App();
            for (const serviceName in App.services) {
                yield App.services[serviceName].start();
                log_1.Log.info(`Service started: ${serviceName}`);
            }
            // tslint:disable-next-line: forin
            for (const route in this.routes) {
                if (this.routes.hasOwnProperty(route)) {
                    const options = this.routes[route];
                    if (options.method === "GET") {
                        App.instance.express.get(route, options.endpoint);
                    }
                    if (options.method === "POST") {
                        App.instance.express.post(route, options.endpoint);
                    }
                    log_1.Log.info(`Route registered: ${options.method} ${route}`);
                }
            }
            return new Promise((resolve, reject) => {
                App.instance.express.listen(opts.port, () => {
                    log_1.Log.info(`Example app listening on port ${opts.port}!`);
                    resolve();
                });
            });
        });
    }
}
/**
 * All services should register in this property
 */
App.services = {
    phonegap: new PhonegapService_1.PhonegapService(),
    scrape: new ScrapeService_1.ScrapeService(),
    build: new BuildService_1.BuildService()
};
/**
 * All routes and their controllers should register in this property
 */
App.routes = {
    "/buildUrl": {
        endpoint: BuildController_1.BuildController.buildWithUrl,
        method: "POST"
    },
    "/checkQueue": {
        endpoint: BuildController_1.BuildController.checkQueueWithUid,
        method: "GET"
    }
};
exports.App = App;
