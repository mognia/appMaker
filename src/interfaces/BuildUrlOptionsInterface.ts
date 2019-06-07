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
   * directory to temporary hold scraped files
   */
  directory?: string;

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
}
