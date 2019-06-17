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
 * @module Scrape
 */
const fs = require("fs-extra");
const Jimp = require("jimp");
const crypto = require("crypto");
const xml2js_1 = require("xml2js");
const zip_a_folder_1 = require("zip-a-folder");
const log_1 = require("../log");
const path = require("path");
class ScrapePlugin {
    apply(registerAction) {
        registerAction("generateFilename", ({ resource }) => __awaiter(this, void 0, void 0, function* () {
            return {
                filename: resource.filename ||
                    crypto.randomBytes(8).toString("hex") +
                        (resource.type
                            ? "." + resource.type
                            : path.extname(resource.url)
                                ? path
                                    .extname(resource.url)
                                    .split("?")[0]
                                    .split("&")[0]
                                : "")
            };
        }));
    }
}
class ScrapeService {
    constructor() { }
    start() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * runs website scrapper against provided URLs in build request options
     * default icon will be copied and if icon is provided in options we will start resizing
     * @param opts
     */
    runScrapper(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = `
    document.addEventListener("online", onDeviceReady, false);
    function onDeviceReady() {
      document.getElementById("offlineErr").style.display = "none";
      window.open('${opts.urls}', '_self ', 'location=no','zoom=no');
    }`;
            yield function () {
                fs.writeFile('./Temp/www/js/index.js', data, (err) => {
                    console.log('The file has been saved!');
                    if (err)
                        throw err;
                });
            };
            // copy default icons
            yield fs.copy("./cordova/res", `./Temp/res`);
            if (opts.icon) {
                yield this.iconResizer(opts);
            }
        });
    }
    /**
     * Resize needed icons using base64 data string image icon provided in build request
     * @param opts
     */
    iconResizer(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.Log.info("start resizing");
            //  let iconName = req.file.filename;
            //making android icons
            const jimp = yield Jimp.read(new Buffer(opts.icon.indexOf(",") === -1 ? opts.icon : opts.icon.split(",")[1], "base64"));
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
            const configStr = yield fs.readFile("./cordova/config.xml", "utf-8");
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
            yield fs.writeFile(`./Temp/config.xml`, xml);
            log_1.Log.info("successfully written our update xml to file");
            log_1.Log.info("start zipping");
            yield zip_a_folder_1.zip(`./Temp`, `./Temp/package.zip`);
        });
    }
}
exports.ScrapeService = ScrapeService;
