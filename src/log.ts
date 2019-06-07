/**
 * @module Core
 */
import chalk from "chalk";
export class Log {
  private static get dateString() {
    return `${new Date().toLocaleString()}`;
  }
  static info(message?: any, ...optionalParams: any[]) {
    console.log(
      chalk.blueBright(Log.dateString + " | ") + message,
      ...optionalParams
    );
  }

  static error(message?: any, ...optionalParams: any[]) {
    console.error(
      chalk.red(Log.dateString + " | ") + message,
      ...optionalParams
    );

    throw message;
  }
}
