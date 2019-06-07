import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as Express from "express";
import * as path from "path";

import { PhonegapService } from "./services/PhonegapService";
import { ScrapeService } from "./services/ScrapeService";
import { BuildController } from "./controllers/BuildController";
import { Log } from "./log";
import { BuildService } from "./services/BuildService";

export class App {
  /**
   * Instance of express
   */
  express = Express();

  /**
   * static instance of whole app. all services and controllers could be accessed using this static property
   */
  static instance: App;

  /**
   * All services should register in this property
   */
  static services = {
    phonegap: new PhonegapService(),
    scrape: new ScrapeService(),
    build: new BuildService()
  };

  /**
   * All routes and their controllers should register in this property
   */

  static routes: {
    [key: string]: {
      endpoint: (req: Express.Request, res: Express.Response) => any | void;
      method: "POST" | "GET";
    };
  } = {
    "/buildUrl": {
      endpoint: BuildController.buildWithUrl,
      method: "POST"
    },
    "/checkQueue": {
      endpoint: BuildController.checkQueueWithUid,
      method: "GET"
    }
  };

  constructor() {
    this.express.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    this.express.use(bodyParser.json());

    // CORS Middleware
    this.express.use(cors());

    // Set Static Folder

    this.express.use(async (req, res, next) => {
      const reqStart = Date.now();
      await next();
      const resTime = Date.now() - reqStart;

      if (!res.headersSent) res.header("X-Response-Time", `${resTime}ms`);
      Log.info(
        `[${req.method}] ${req.url} in ${resTime}ms | ${
          res.statusCode
        } ${res.statusMessage || ""} `
      );
    });

    this.express.use(Express.static(path.join(__dirname, "..", "public")));
  }

  static async bootstrap(opts: { port: number }) {
    App.instance = new App();

    for (const serviceName in App.services) {
      await App.services[serviceName].start();
      Log.info(`Service started: ${serviceName}`);
    }

    // tslint:disable-next-line: forin
    for (const route in this.routes) {
      if (this.routes.hasOwnProperty(route)) {
        const options = this.routes[route];
        if (options.method === "GET") {
          App.instance.express.get(route, options.endpoint);
        }

        if (options.method === "POST") {
          App.instance.express.post(route, options.endpoint);
        }

        Log.info(`Route registered: ${options.method} ${route}`);
      }
    }

    return new Promise((resolve, reject) => {
      App.instance.express.listen(opts.port, () => {
        Log.info(`Example app listening on port ${opts.port}!`);
        resolve();
      });
    });
  }
}
