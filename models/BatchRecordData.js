import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldValue: { type: mongoose.Schema.Types.Mixed, required: false, default: null },
  fieldType: { type: String, enum: ['text', 'float', 'int', 'date', 'checkbox'] }
}, { _id: false });

const batchRecordDataSchema = new mongoose.Schema({
  batchRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'BatchRecord', required: true },
  sectionName: { type: String, required: true },
  status: { type: String, required: true },
  fields: [fieldSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

batchRecordDataSchema.index({ batchRecord: 1, sectionName: 1 }, { unique: true });

const BatchRecordData = mongoose.models.BatchRecordData || mongoose.model('BatchRecordData', batchRecordDataSchema);

export default BatchRecordData;