"use strict";
/**
 * @module Build
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const app_1 = require("../app");
const log_1 = require("../log");
/**
 * Responsible for Queueing build requests
 */
class BuildService {
    constructor() { }
    /**
     * runs on service start process, starts a timer for build queue
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setInterval(() => {
                    if (!this.currentQueueItem) {
                        this.initiateQueue()
                            .then(() => { })
                            .catch((e) => __awaiter(this, void 0, void 0, function* () {
                            if (this.currentQueueItem) {
                                const optionsPath = "./queue/" + this.currentQueueItem.uid + ".json";
                                this.currentQueueItem.processingError = (e || "").toString();
                                yield fs.writeJSON(optionsPath, this.currentQueueItem);
                                this.currentQueueItem = null;
                            }
                            log_1.Log.error(e);
                        }));
                    }
                }, 1000);
            }
            catch (e) { }
        });
    }
    /**
     * proceed queue by one
     */
    initiateQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.ensureDir("./queue");
            const queueFiles = yield fs.readdir("./queue");
            let optionsPath;
            let options;
            for (const file of queueFiles) {
                optionsPath = "./queue/" + file;
                options = yield fs.readJson(optionsPath);
                if (!options.processingStarted ||
                    (options.processingStarted &&
                        !options.processingFinished &&
                        !options.processingError &&
                        Date.now() - options.processingStarted > 60000)) {
                    break;
                }
                else
                    options = null;
            }
            if (options) {
                log_1.Log.info("found item to process", options);
                this.currentQueueItem = options;
                options.processingStarted = Date.now();
                yield fs.writeJSON(optionsPath, options);
                yield app_1.App.services.scrape.runScrapper(options);
                yield app_1.App.services.scrape.writeConfig(options);
                const pbService = app_1.App.services.phonegap;
                const pbApi = yield pbService.authUser();
                yield pbService.removePrevious(pbApi);
                yield pbService.uploadApp(options, pbApi);
                const newApp = yield pbService.currentApp(pbApi);
                yield pbService.buildApp(newApp.id, pbApi);
                yield pbService.downloadApp(options, newApp.id, pbApi);
                options.processingFinished = Date.now();
                yield fs.writeJSON(optionsPath, options);
                this.currentQueueItem = null;
            }
        });
    }
}
exports.BuildService = BuildService;
