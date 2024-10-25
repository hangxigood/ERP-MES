import dbConnect from './mongoose';

export async function setupChangeStreams() {
  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  // Watch specific collections
  const collections = ['batchrecords', 'batchrecorddatas', 'users'];
  
  collections.forEach(collectionName => {
    const collection = db.collection(collectionName);
    const changeStream = collection.watch([], { fullDocument: 'updateLookup' });

    changeStream.on('change', async (change) => {
      console.log('Change detected:', change.operationType, change.documentKey._id);
      try {
        const auditEntry = {
          operationType: change.operationType,
          collectionName,
          documentId: change.documentKey._id,
          timestamp: new Date(),
          fullDocument: change.fullDocument,
          updateDescription: change.updateDescription,
          // Additional metadata as needed
        };

        // Store the audit entry
        await db.collection('auditlogs').insertOne(auditEntry);

      } catch (error) {
        console.error('Error processing change stream:', error);
      }
    });
  });
}
