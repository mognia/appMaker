/**
 * @module Build
 */
import { QueueItemInterface } from "./QueueItemInterface";

/**
 * Interface used in build processes for converting scraped URLs to apps (ANDROID for now)
 */
export interface BuildUrlOptionsInterface extends QueueItemInterface {
  /**
   * URLs to scrape from
   */
  urls?: string[];

  /**
   * app name to use for building and also writing config.xml
   */
  appName?: string;

  /**
   * base64 data string of icon used for the app
   */
  icon?: string;

  /**
   * IP address of whom requested the build
   */
  ip?: string;

  /**
   * Boolean, if true scraper will follow hyperlinks in html files. Don't forget to set maxRecursiveDepth to avoid infinite downloading. Defaults to false.
   */
  recursive?: boolean;

  /**
   * Positive number, maximum allowed depth for hyperlinks. Other dependencies will be saved regardless of their depth. Defaults to null - no maximum recursive depth set.
   */
  maxRecursiveDepth?: number;

  /**
   * Number, maximum amount of concurrent requests. Defaults to Infinity.


   */
  requestConcurrency?: number;
}
