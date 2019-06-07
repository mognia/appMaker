import * as client from "phonegap-build-api";
import * as fs from "fs-extra";
import { rejects } from "assert";
import { resolve } from "path";
import { Log } from "../log";
import { BuildUrlOptionsInterface } from "../interfaces/BuildUrlOptionsInterface";
export class PhonegapService {
  constructor() {}
  async start() {}

  authUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (
        !process.env["phonegap.username"] ||
        !process.env["phonegap.password"]
      ) {
        reject("Provide phonegap.username and phonegap.username env variables");
      }
      client.auth(
        {
          username: process.env["phonegap.username"],
          password: process.env["phonegap.password"]
        },
        function(e: any, api: any) {
          if (e) return reject(e);
          return resolve(api);
        }
      );
    });
  }

  async currentApp(api: {
    get: (arg0: string, arg1: (e: any, data: any) => Promise<void>) => void;
  }): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
      api.get("/apps", async function(
        e: any,
        data: { apps: ({ id: string } | PromiseLike<{ id: string }>)[] }
      ) {
        if (e) return reject(e);

        return resolve(data.apps[0]);
      });
    });
  }

  async removePrevious(api: any) {
    const currentApp = await this.currentApp(api);
    if (currentApp) await this.removeApp(currentApp.id, api);
  }

  async buildApp(id: string, api: any) {
    var options = {
      form: {
        data: {
          platforms: ["android"]
        }
      }
    };

    return new Promise((resolve, _reject) => {
      api.post(`/apps/${id}/build`, options, async function(
        e: (() => Promise<any>) | Promise<any>
      ) {
        if (e) return rejects(e);

        let refreshId = setInterval(() => {
          api.get(
            `/apps/${id}`,
            async (_e: any, data: { status: { android: string } }) => {
              if (data.status.android === "complete") {
                clearInterval(refreshId);
                Log.info("android completed!");
                resolve();
              }
            }
          );
        }, 5000);
      });
    });
  }

  /**
   * Remove app from phonegap with ID
   * @param id ID of app in phonegap build service
   * @param api instance of phonegap API
   */
  private removeApp(id: string, api: any) {
    return new Promise((resolve, _reject) => {
      api.del(
        `/apps/${id}`,
        (
          e: (() => Promise<any>) | Promise<any>,
          data: {} | PromiseLike<{}>
        ) => {
          if (e) return rejects(e);
          if (data) return resolve(data);
        }
      );
    });
  }

  async uploadApp(
    opts: BuildUrlOptionsInterface,
    api: {
      post: (
        arg0: string,
        arg1: {
          form: {
            data: { title: string; create_method: string };
            file: string;
          };
        },
        arg2: (e: any, data: any) => Promise<void>
      ) => void;
    }
  ) {
    var options = {
      form: {
        data: {
          title: opts.appName,
          create_method: "file"
        },
        file: `./temp/${opts.uid}/package.zip`
      }
    };

    await new Promise((resolve, reject) => {
      api.post("/apps", options, async function(
        e: any,
        data: { id: string } | PromiseLike<{ id: string }>
      ) {
        if (e) reject(e);

        Log.info("app uploaded", data);
        // TODO: delete zip folder after upload
        resolve(data);
      });
    });
  }

  /**
   * Download builded android app from phonegap to public/apk/{uid}/{appName}
   * @param opts
   * @param id ID of app in phonegap build services
   * @param api phonegap API instance
   */
  async downloadApp(
    opts: BuildUrlOptionsInterface,
    id: string,
    api: any
  ): Promise<{ success: boolean; apk: string }> {
    await fs.ensureDir(`./public/apk/${opts.uid}`);
    let file = fs.createWriteStream(
      `./public/apk/${opts.uid}/${opts.appName}.apk`
    );
    await api.get(`/apps/${id}/android`).pipe(file);

    return new Promise((resolve, reject) => {
      file.on("error", e => reject(e));
      file.on("close", () => resolve());
    });
  }
}
