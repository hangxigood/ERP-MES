import mongoose from 'mongoose';

const batchRecordSchema = new mongoose.Schema({
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  status: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });


const BatchRecord = mongoose.models.BatchRecord || mongoose.model('BatchRecord', batchRecordSchema);

export default BatchRecord;