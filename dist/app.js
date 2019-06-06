"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cors = require("cors");
const Express = require("express");
const path = require("path");
const PhonegapService_1 = require("./services/PhonegapService");
const ScrapeService_1 = require("./services/ScrapeService");
const BuildController_1 = require("./controllers/BuildController");
const log_1 = require("./log");
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
        this.express.use(Express.static(path.join(__dirname, "..", "public")));
    }
    static bootstrap(opts) {
        App.instance = new App();
        return new Promise((resolve, reject) => {
            App.instance.express.listen(opts.port, () => {
                log_1.Log.info(`Example app listening on port ${opts.port}!`);
                resolve();
            });
        });
    }
}
/**
 * All services should register in this property
 */
App.services = {
    phonegap: new PhonegapService_1.PhonegapService(),
    scrape: new ScrapeService_1.ScrapeService()
};
/**
 * All routes and their controllers should register in this property
 */
App.routes = {
    "/sendUrl": {
        endpoint: BuildController_1.BuildController.buildWithUrl,
        method: "POST"
    }
};
exports.App = App;
