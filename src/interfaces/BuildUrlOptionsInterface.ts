import { QueueItemInterface } from "./QueueItemInterface";

export interface BuildUrlOptionsInterface extends QueueItemInterface {
  urls?: string[];
  directory?: string;
  appName?: string;
  icon?: string;
  ip?: string;
}
