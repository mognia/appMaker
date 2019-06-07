/**
 * @module Build
 */
import { text } from "serendip-utility";
import { Request, Response } from "express";
import * as fs from "fs-extra";

import { BuildUrlOptionsInterface } from "../interfaces/BuildUrlOptionsInterface";
import { Log } from "../log";
 

/**
 * This controller is responsible for build endpoints
 */
export class BuildController {
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
    if (!req.body.url) {
      res.status(400);
      res.end();
    }

    const appName =
      req.body.name ||
      req.body.url
        .replace("https://", "")
        .replace("http://", "")
        .replace(/\W/g, " ");

    const uid = text.randomAsciiString(12);
    let options: BuildUrlOptionsInterface = {
      uid,
      urls: [req.body.url],
      directory: `./temp/${uid}/www`,
      appName: appName,
      icon: req.body.icon,
      ip: req.ip,
      recursive: true,
      maxRecursiveDepth: req.body.maxRecursiveDepth || 3,
      requestConcurrency: req.body.requestConcurrency || 32
    };

    Log.info("build request", options);

    await fs.ensureDir("./queue");

    await fs.writeJSON("./queue/" + uid + ".json", options);

    res.json(options);

    //download whole website

    //auth user in phonegap build with token
  }
}
