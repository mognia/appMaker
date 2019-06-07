import * as multer from "multer";
import { App } from "../app";
import * as Jimp from "jimp";
import * as scrape from "website-scraper";
import * as fs from "fs-extra";
import { parseString, Builder } from "xml2js";
import { zip } from "zip-a-folder";
import { Log } from "../log";
export class ScrapeService {
  constructor() {}
  async start() {}
  async run(opts: {
    urls: string[];
    directory: string;
    icon: string;
    appName: string;
    uid: string;
  }) {
    if (fs.existsSync(opts.directory)) await fs.unlink(opts.directory);
    await scrape(opts);

    await fs.copy("./cordova/res", `./temp/${opts.uid}/res`);

    if (opts.icon) {
      await this.iconResizer(opts);
    }
  }

  async iconResizer(opts: { icon: string; uid: string }) {
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

  async writeConfig(opts: { uid: string; appName: string }) {
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
