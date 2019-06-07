/**
 * @module Build
 */

/**
 * All items that will be put in build queue should implement this interface
 */
export interface QueueItemInterface {
  /**
   * Unique id of queue item
   */
  uid?: string;

  /**
   * Date timestamp when process started
   */
  processingStarted?: number;

  /**
   * Date timestamp when process finished
   */
  processingFinished?: number;

  /**
   * Error message if error ocurred during process
   */
  processingError?: string;
}
