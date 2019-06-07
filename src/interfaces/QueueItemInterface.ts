export interface QueueItemInterface {
  uid?: string;

  processingStarted?: number;
  processingFinished?: number;
  processingError?: string;
}
