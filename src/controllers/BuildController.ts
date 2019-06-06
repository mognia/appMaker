import * as multer from "multer";
import { Request, Response } from "express";
import * as fs from "fs-extra";
import { App } from "../app";
import { Log } from "../log";

export class BuildController {
  constructor() {}

  static async buildWithUrl(req: Request, res: Response) {
    multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, "./icons"),
        filename: (req, file, cb) => cb(null, file.originalname) // modified here  or user file.mimetype
      })
    }).single("icon");

    //validate user URL
    Log.info(req.body.url);

console.log(req.file.filename);

    let options = {
      urls: [req.body.url],
      directory: "./temp/www",
      appName: "app-name-temp",
      iconName: req.file.filename
    };
    // Log.info();

    if (fs.existsSync(options.directory)) await fs.unlink(options.directory);

    await App.services.scrape.run(options);

    const pbService = App.services.phonegap;
    const pbApi = await pbService.authUser();
    await pbService.removePrevious(pbApi);

    await pbService.uploadApp(pbApi);

    const newApp = await pbService.currentApp(pbApi);

    await pbService.buildApp(newApp.id, pbApi);
    await pbService.downloadApp(newApp.id, pbApi);

    res.json({
      success: true,
      apk: `/readyApps/${"temp"}.apk`
    });
    //download whole website

    //auth user in phonegap build with token
  }
}
