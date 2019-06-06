import { App } from "./app";
import { Log } from "./log";
import * as dotenv from "dotenv";

// this fills process.env from .env file in root of the project
dotenv.config();

// starting bootstrap... includes starting services, registering routes and middleware
App.bootstrap({
  port: (process.env.port as any) || 3000
})
  .then(() => {
    Log.info("App started successfully");
  })
  .catch(e => {
    Log.error("App start error", e);
  });
