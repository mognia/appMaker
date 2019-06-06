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
const Jimp = require("jimp");
const scrape = require("website-scraper");
const fs = require("fs-extra");
const xml2js_1 = require("xml2js");
const zip_a_folder_1 = require("zip-a-folder");
const log_1 = require("../log");
class ScrapeService {
    constructor() { }
    start() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(opts.directory))
                yield fs.unlink(opts.directory);
            yield scrape(opts);
            yield this.iconResizer(opts.iconName);
        });
    }
    iconResizer(iconName) {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.Log.info("start resizing");
            //  let iconName = req.file.filename;
            //making android icons
            const jimp = yield Jimp.read(`./icons/${iconName}`);
            const neededIcons = {
                36: "ldpi",
                48: "mdpi",
                72: "hdpi",
                96: "xhdpi",
                144: "xxhdpi",
                192: "xxxhdpi"
            };
            for (const size in neededIcons) {
                yield new Promise((resolve, reject) => {
                    jimp
                        .resize(parseInt(size), parseInt(size), Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                        .write(`./Temp/res/icon/android/drawable-${neededIcons[size]}-icon.png`, err => {
                        if (err)
                            return reject(err);
                        resolve();
                    });
                });
            }
        });
    }
    writeConfig(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const configStr = yield fs.readFile("./Temp/config.xml", "utf-8");
            const json = yield new Promise((resolve, reject) => {
                xml2js_1.parseString(configStr, (err, result) => {
                    if (err)
                        reject(err);
                    resolve(result);
                });
            });
            json.widget.name = [opts.appName];
            // create a new builder object and then convert
            // our json back to xml.
            var builder = new xml2js_1.Builder();
            var xml = builder.buildObject(json);
            yield fs.writeFile("./Temp/config.xml", xml);
            log_1.Log.info("successfully written our update xml to file");
            log_1.Log.info("start zipping");
            yield zip_a_folder_1.zip("./temp", "./temp.zip");
            yield app_1.App.services.phonegap.authUser();
        });
    }
}
exports.ScrapeService = ScrapeService;
