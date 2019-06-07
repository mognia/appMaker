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
const app_1 = require("../app");
const fs = require("fs-extra");
const log_1 = require("../log");
class BuildService {
    constructor() { }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            setInterval(() => {
                if (!this.currentQueueItem) {
                    this.initiateQueue()
                        .then(() => { })
                        .catch(e => {
                        log_1.Log.error(e);
                    });
                }
            }, 1000);
        });
    }
    initiateQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            const queueFiles = yield fs.readdir("./queue");
            let optionsPath;
            let options;
            for (const file of queueFiles) {
                optionsPath = "./queue/" + file;
                options = yield fs.readJson(optionsPath);
                if (!options.processingStarted ||
                    (options.processingStarted &&
                        !options.processingFinished &&
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
                if (fs.existsSync(options.directory)) {
                    yield fs.emptyDir(options.directory);
                    yield fs.rmdir(options.directory);
                }
                yield app_1.App.services.scrape.run(options);
                yield app_1.App.services.scrape.writeConfig(options);
                const pbService = app_1.App.services.phonegap;
                const pbApi = yield pbService.authUser();
                yield pbService.removePrevious(pbApi);
                //  await pbService.uploadApp(options, pbApi);
                const newApp = yield pbService.currentApp(pbApi);
                //  await pbService.buildApp(newApp.id, pbApi);
                //  await pbService.downloadApp(options, newApp.id, pbApi);
                options.processingFinished = Date.now();
                yield fs.writeJSON(optionsPath, options);
            }
        });
    }
}
exports.BuildService = BuildService;
