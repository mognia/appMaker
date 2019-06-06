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
const phonegap_build_api_1 = require("phonegap-build-api");
const fs = require("fs-extra");
const assert_1 = require("assert");
const log_1 = require("../log");
class PhonegapService {
    constructor() { }
    start() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    authUser() {
        const token = process.env.TOKEN;
        return new Promise((resolve, reject) => {
            phonegap_build_api_1.default.auth({ token: token }, function (e, api) {
                if (e)
                    return reject(e);
                return resolve(api);
            });
        });
    }
    currentApp(api) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                api.get("/apps", function (e, data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (e)
                            return reject(e);
                        return resolve(data.apps[0]);
                    });
                });
            });
        });
    }
    removePrevious(api) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentApp = yield this.currentApp(api);
            if (currentApp)
                yield this.removeApp(currentApp.id, api);
        });
    }
    buildApp(id, api) {
        return __awaiter(this, void 0, void 0, function* () {
            var options = {
                form: {
                    data: {
                        platforms: ["android"]
                    }
                }
            };
            api.post(`/apps/${id}/build`, options, function (e, data) {
                return __awaiter(this, void 0, void 0, function* () {
                    log_1.Log.info("error:", e);
                    log_1.Log.info("data : ", data);
                    let refreshId = setInterval(function () {
                        api.get(`/apps/${id}`, function (e, data) {
                            return __awaiter(this, void 0, void 0, function* () {
                                log_1.Log.info("data:", data);
                                if (data.status.android === "complete") {
                                    clearInterval(refreshId);
                                    log_1.Log.info("android compelete!");
                                    yield this.downloadApp(data.id, api);
                                }
                            });
                        });
                    }, 5000);
                });
            });
        });
    }
    removeApp(id, api) {
        return new Promise((resolve, reject) => {
            api.del(`/apps/${id}`, (e, data) => {
                if (e)
                    return assert_1.rejects(e);
                if (data)
                    return resolve(data);
            });
        });
    }
    uploadApp(api) {
        return __awaiter(this, void 0, void 0, function* () {
            var options = {
                form: {
                    data: {
                        // TODO: get title from URL
                        title: "My App",
                        create_method: "file"
                    },
                    file: "./temp.zip"
                }
            };
            const pbApp = yield new Promise((resolve, reject) => {
                api.post("/apps", options, function (e, data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (e)
                            reject(e);
                        // TODO: delete zip folder after upload
                        resolve(data);
                    });
                });
            });
        });
    }
    downloadApp(id, api) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = fs.createWriteStream(`./readyApps/${"temp"}.apk`);
            yield api.get(`/apps/${id}/android`).pipe(file);
            return new Promise((resolve, reject) => {
                file.on("error", e => reject(e));
                file.on("close", () => resolve());
            });
        });
    }
}
exports.PhonegapService = PhonegapService;
