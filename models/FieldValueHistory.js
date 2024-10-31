import mongoose from 'mongoose';

const fieldValueHistorySchema = new mongoose.Schema({
  batchRecordData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BatchRecordData',
    required: true,
    index: true
  },
  sectionName: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Store the entire fields array as a snapshot
  fieldsSnapshot: [{
    fieldName: String,
    fieldType: String,
    fieldValue: mongoose.Schema.Types.Mixed
  }],
  metadata: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userRole: String,
    clientInfo: mongoose.Schema.Types.Mixed
  }
});

// Create compound index for efficient querying
fieldValueHistorySchema.index({ batchRecordData: 1, version: 1 });

export default mongoose.models.FieldValueHistory || 
  mongoose.model('FieldValueHistory', fieldValueHistorySchema); 