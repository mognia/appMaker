"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const log_1 = require("./log");
const dotenv = require("dotenv");
// this fills process.env from .env file in root of the project
dotenv.config();
// starting bootstrap... includes starting services, registering routes and middleware
app_1.App.bootstrap({
    port: process.env.port || 3000
})
    .then(() => {
    log_1.Log.info("App started successfully");
})
    .catch(e => {
    log_1.Log.error("App start error", e);
});
