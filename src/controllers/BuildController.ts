import * as multer from "multer";
import { Request, Response } from "express";
import * as fs from "fs-extra";
import { App } from "../app";
import { Log } from "../log";

export class BuildController {
  constructor() {}

  static async buildWithUrl(req: Request, res: Response) {
    await new Promise((resolve, reject) => {
      multer({
        storage: multer.diskStorage({
          destination: (req, file, cb) => cb(null, "./icons"),
          filename: (req, file, cb) => cb(null, file.originalname) // modified here  or user file.mimetype
        })
      }).single("icon")(req, res, err => {
        if (err) return reject(err);
        resolve();
      });
    });
    //validate user URL
    Log.info(req.body.url);

    let options = {
      urls: [req.body.url],
      directory: "./temp/www",
      appName: "app-name-temp",
      iconName: req.file ? req.file.filename : null
    };
    // Log.info();

    if (fs.existsSync(options.directory)) {
      await fs.emptyDir(options.directory);
      await fs.rmdir(options.directory);
    }

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
