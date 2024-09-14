import mongoose from 'mongoose';

const batchRecordDataSchema = new mongoose.Schema({
  batchRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'BatchRecord', required: true },
  sectionName: { type: String, required: true },
  status: { type: String, required: true },
  fieldName: { type: String, required: true },
  fieldValue: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const BatchRecordData = mongoose.models.BatchRecordData || mongoose.model('BatchRecordData', batchRecordDataSchema);

export default BatchRecordData;