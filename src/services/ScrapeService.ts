/**
 * @module Scrape
 */
import * as fs from "fs-extra";
import * as Jimp from "jimp";
import * as scrape from "website-scraper";
import { Builder, parseString } from "xml2js";
import { zip } from "zip-a-folder";

import { BuildUrlOptionsInterface } from "../interfaces/BuildUrlOptionsInterface";
import { Log } from "../log";

export class ScrapeService {
  constructor() {}
  async start() {}

  /**
   * runs website scrapper against provided URLs in build request options
   * default icon will be copied and if icon is provided in options we will start resizing
   * @param opts
   */
  public async runScrapper(opts: BuildUrlOptionsInterface) {
    if (fs.existsSync(opts.directory)) await fs.unlink(opts.directory);

    await scrape({
      ...opts,
      ...{
        urlFilter: (url: string) => {
          const urlValid =
            url.indexOf("cdn.jsdelivr.com") !== -1 ||
            url.indexOf("fonts.googleapis.com") !== -1 ||
            url.indexOf("ajax.cloudflare.com") !== -1 ||
            url.indexOf("cdnjs.cloudflare.com") !== -1 ||
            url.indexOf("stackpath.bootstrapcdn.com") !== -1 ||
            url.indexOf("code.jquery.com") !== -1 ||
            !url.startsWith("http") ||
            url.replace("https://", "http://").startsWith(opts.urls[0]) ||
            url.replace("http://", "https://").startsWith(opts.urls[0]);
          Log.info("url filter", url, urlValid);
          return urlValid;
        }
      }
    });

    // copy default icons
    await fs.copy("./cordova/res", `./temp/${opts.uid}/res`);

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

    for (const size in neededIcons) {
      await new Promise((resolve, reject) => {
        jimp
          .resize(parseInt(size), parseInt(size), Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
          .write(
            `./temp/${opts.uid}/res/icon/android/drawable-${
              neededIcons[size]
            }-icon.png`,
            err => {
              if (err) return reject(err);
              resolve();
            }
          );
      });
    }
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

    await fs.writeFile(`./temp/${opts.uid}/config.xml`, xml);

    Log.info("successfully written our update xml to file");
    Log.info("start zipping");
    await zip(`./temp/${opts.uid}`, `./temp/${opts.uid}/package.zip`);
  }
}
