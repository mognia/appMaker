/**
 * @module Scrape
 */
import * as fs from "fs-extra";
import * as Jimp from "jimp";
import * as crypto from "crypto";
import { Builder, parseString } from "xml2js";
import { zip } from "zip-a-folder";

import { BuildUrlOptionsInterface } from "../interfaces/BuildUrlOptionsInterface";
import { Log } from "../log";
import * as path from "path";
import { resolve } from "url";

class ScrapePlugin {
  apply(registerAction) {
    registerAction("generateFilename", async ({ resource }) => {
      return {
        filename:
          resource.filename ||
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
    });
  }
}
export class ScrapeService {
  constructor() { }
  async start() { }

  /**
   * runs website scrapper against provided URLs in build request options
   * default icon will be copied and if icon is provided in options we will start resizing
   * @param opts
   */
  public async runScrapper(opts: BuildUrlOptionsInterface) {

    const data = `
    document.addEventListener("online", onDeviceReady, false);
    function onDeviceReady() {
      document.getElementById("offlineErr").style.display = "none";
      window.open('${opts.urls}', '_self ', 'location=no','zoom=no');
    }`
    await new Promise((resolve, reject) => {

      fs.writeFile('./Temp/www/js/index.js', data, (err) => {
        console.log('The file has been saved!');
        if (err) return reject(err);
        resolve(data)
      });
    })



    // copy default icons
    await fs.copy("./cordova/res", `./Temp/res`);

    if (opts.icon) {
      await this.iconResizer(opts);
    }
  }

  /**
   * Resize needed icons using base64 data string image icon provided in build request
   * @param opts
   */
  private async iconResizer(opts: BuildUrlOptionsInterface) {
    Log.info("start resizing");
    //  let iconName = req.file.filename;
    //making android icons

    const jimp = await Jimp.read(
      new Buffer(
        opts.icon.indexOf(",") === -1 ? opts.icon : opts.icon.split(",")[1],
        "base64"
      )
    );

    const neededIcons = {
      36: "ldpi",
      48: "mdpi",
      72: "hdpi",
      96: "xhdpi",
      144: "xxhdpi",
      192: "xxxhdpi"
    };

    await new Promise((resolve, reject) => {
      jimp.resize(192, 192) // resize
        .write('./Temp/res/icon/android/drawable-xxxhdpi-icon.png'); // save

      jimp.resize(144, 144) // resize
        .write('./Temp/res/icon/android/drawable-xxhdpi-icon.png'); // save

      jimp.resize(96, 96) // resize
        .write('./Temp/res/icon/android/drawable-xhdpi-icon.png'); // save
      jimp.resize(72, 72, jimp.RESIZE_BILINEAR) // resize
        .write('./Temp/res/icon/android/drawable-hdpi-icon.png'); // save

      jimp.resize(48, 48) // resize
        .write('./Temp/res/icon/android/drawable-mdpi-icon.png'); // save


      jimp.resize(36, 36) // resize
        .write('./Temp/res/icon/android/drawable-ldpi-icon.png'); // save

        resolve();
    });

  }

  async writeConfig(opts: BuildUrlOptionsInterface) {
    const configStr = await fs.readFile("./cordova/config.xml", "utf-8");

    const json: any = await new Promise((resolve, reject) => {
      parseString(configStr, (err: any, result: any) => {
        if (err) reject(err);

        resolve(result);
      });
    });

    json.widget.name = [opts.appName];

    // create a new builder object and then convert
    // our json back to xml.

    var builder = new Builder();
    var xml = builder.buildObject(json);

    await fs.writeFile(`./Temp/config.xml`, xml);

    Log.info("successfully written our update xml to file");
    Log.info("start zipping");
    await zip(`./Temp`, `./Temp/package.zip`);
  }
}
