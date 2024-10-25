import { setupChangeStreams } from './changeStream';

export function initChangeStreams() {
  setupChangeStreams().catch(console.error);
}
