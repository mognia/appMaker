"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
class Log {
    static get dateString() {
        return `${new Date().toLocaleString()}`;
    }
    static info(message, ...optionalParams) {
        console.log(chalk_1.default.blueBright(Log.dateString + " | ") + message, ...optionalParams);
    }
    static error(message, ...optionalParams) {
        console.error(chalk_1.default.red(Log.dateString + " | ") + message, ...optionalParams);
        throw message;
    }
}
exports.Log = Log;
