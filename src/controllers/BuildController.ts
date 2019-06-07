import * as multer from "multer";
import { Request, Response } from "express";
import * as fs from "fs-extra";
import { App } from "../app";
import { Log } from "../log";
import ObjectId from "bson-objectid";
import { BuildUrlOptionsInterface } from "../interfaces/BuildUrlOptionsInterface";

export class BuildController {
  constructor() {}

  static async checkQueueWithUid(req: Request, res: Response) {
    const itemPath = `./queue/${req.query.uid}.json`;
    if (await fs.pathExists(itemPath)) {
      res.json(await fs.readJSON(itemPath));
    } else {
      res.sendStatus(404);
      res.end();
    }
  }

  static async buildWithUrl(req: Request, res: Response) {
    const appName =
      req.body.name ||
      req.body.url
        .split("//")[1]
        .split("/")[0]
        .split(":")[0];

    const uid = new ObjectId().str;
    let options: BuildUrlOptionsInterface = {
      uid,
      urls: [req.body.url],
      directory: `./temp/${uid}/www`,
      appName: appName,
      icon: req.body.icon,
      ip: req.ip
    };

    Log.info("build request", options);

    await fs.ensureDir("./queue");

    await fs.writeJSON("./queue/" + uid + ".json", options);

    res.json(options);

    //download whole website

    //auth user in phonegap build with token
  }
}
