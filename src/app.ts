import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as Express from "express";
import * as path from "path";

import { PhonegapService } from "./services/PhonegapService";
import { ScrapeService } from "./services/ScrapeService";
import { BuildController } from "./controllers/BuildController";
import { Log } from "./log";

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
    scrape: new ScrapeService()
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
    "/sendUrl": {
      endpoint: BuildController.buildWithUrl,
      method: "POST"
    }
  };

  constructor() {
    this.express.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    this.express.use(bodyParser.json());

    // CORS Middleware
    this.express.use(cors());

    // Set Static Folder
    this.express.use(Express.static(path.join(__dirname, "..", "public")));
  }

  static bootstrap(opts: { port: number }) {
    App.instance = new App();

    return new Promise((resolve, reject) => {
      App.instance.express.listen(opts.port, () => {
        Log.info(`Example app listening on port ${opts.port}!`);
        resolve();
      });
    });
  }
}
