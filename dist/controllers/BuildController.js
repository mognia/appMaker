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
const multer = require("multer");
const fs = require("fs-extra");
const app_1 = require("../app");
const log_1 = require("../log");
class BuildController {
    constructor() { }
    static buildWithUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            multer({
                storage: multer.diskStorage({
                    destination: (req, file, cb) => cb(null, "./icons"),
                    filename: (req, file, cb) => cb(null, file.originalname) // modified here  or user file.mimetype
                })
            }).single("icon");
            //validate user URL
            log_1.Log.info(req.body.url);
            let options = {
                urls: [req.body.url],
                directory: "./temp/www",
                appName: "app-name-temp",
                iconName: req.file.filename
            };
            // Log.info();
            if (fs.existsSync(options.directory))
                yield fs.unlink(options.directory);
            yield app_1.App.services.scrape.run(options);
            const pbService = app_1.App.services.phonegap;
            const pbApi = yield pbService.authUser();
            yield pbService.removePrevious(pbApi);
            yield pbService.uploadApp(pbApi);
            const newApp = yield pbService.currentApp(pbApi);
            yield pbService.buildApp(newApp.id, pbApi);
            yield pbService.downloadApp(newApp.id, pbApi);
            res.json({
                success: true,
                apk: `/readyApps/${"temp"}.apk`
            });
            //download whole website
            //auth user in phonegap build with token
        });
    }
}
exports.BuildController = BuildController;
