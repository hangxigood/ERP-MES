import { setupChangeStreams } from './changeStream';

let changeStreamInstance = null;

export async function initChangeStreams() {
  try {
    changeStreamInstance = await setupChangeStreams();
    console.log('Change streams initialized successfully');
  } catch (error) {
    console.error('Failed to initialize change streams:', error);
    // You might want to implement retry logic here
    throw error; // Re-throw if you want upstream handling
  }
}

export async function closeChangeStreams() {
  try {
    if (changeStreamInstance) {
      await changeStreamInstance.close();
      changeStreamInstance = null;
      console.log('Change streams closed successfully');
    }
  } catch (error) {
    console.error('Error closing change streams:', error);
    throw error;
  }
}

// Optional: Add health check method
export function isChangeStreamActive() {
  return changeStreamInstance !== null;
}
