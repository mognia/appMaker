import * as client from "phonegap-build-api";
import * as fs from "fs-extra";
import { rejects } from "assert";
import { resolve } from "path";
import { Log } from "../log";
export class PhonegapService {
  constructor() {}
  async start() {}

  authUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      client.auth(
        {
          username: process.env["phonegap.username"],
          password: process.env["phonegap.password"]
        },
        function(e, api) {
          if (e) return reject(e);
          return resolve(api);
        }
      );
    });
  }

  async currentApp(api): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
      api.get("/apps", async function(e, data) {
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
    api.post(`/apps/${id}/build`, options, async function(e, data) {
      Log.info("error:", e);
      Log.info("data : ", data);
      let refreshId = setInterval(function() {
        api.get(`/apps/${id}`, async function(e, data) {
          Log.info("data:", data);
          if (data.status.android === "complete") {
            clearInterval(refreshId);
            Log.info("android compelete!");

            await this.downloadApp(data.id, api);
          }
        });
      }, 5000);
    });
  }

  private removeApp(id: string, api) {
    return new Promise((resolve, reject) => {
      api.del(`/apps/${id}`, (e, data) => {
        if (e) return rejects(e);
        if (data) return resolve(data);
      });
    });
  }

  async uploadApp(api) {
    var options = {
      form: {
        data: {
          // TODO: get title from URL
          title: "My App",
          create_method: "file"
        },
        file: "./temp.zip"
      }
    };

    const pbApp: { id: string } = await new Promise((resolve, reject) => {
      api.post("/apps", options, async function(e, data) {
        if (e) reject(e);
        // TODO: delete zip folder after upload
        resolve(data);
      });
    });
  }

  async downloadApp(id, api): Promise<{ success: boolean; apk: string }> {
    let file = fs.createWriteStream(`./readyApps/${"temp"}.apk`);
    await api.get(`/apps/${id}/android`).pipe(file);

    return new Promise((resolve, reject) => {
      file.on("error", e => reject(e));
      file.on("close", () => resolve());
    });
  }
}
