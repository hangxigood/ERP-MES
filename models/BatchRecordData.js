import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldValue: { type: mongoose.Schema.Types.Mixed },
  fieldType: { type: String, required: true, enum: ['text', 'float', 'int', 'date', 'checkbox'] }
}, { _id: false });

const batchRecordDataSchema = new mongoose.Schema({
  batchRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'BatchRecord', required: true },
  sectionName: { type: String, required: true },
  sectionDescription: { type: String },
  duplicatable: { type: Boolean, default: false },
  order: { type: Number, required: true }, // Section order
  status: { type: String, required: true, enum: ['Not Started', 'In Progress', 'Completed'] },
  fields: [fieldSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  signoffs: [{
    signedBy: { type: String },
    signedAt: { type: Date },
    comment: { type: String }
  }],
  version: { type: Number, default: 1 },
  isDuplicate: { type: Boolean, default: false }
}, { timestamps: true });

batchRecordDataSchema.index({ batchRecord: 1, sectionName: 1 }, { unique: true });

// Simplified middleware for version history
batchRecordDataSchema.pre('save', async function(next) {
  // Record both initial creation and subsequent updates
  if (this.isNew || this.isModified('fields')) {
    // For new documents, version stays at 1
    // For updates, increment the version
    if (!this.isNew) {
      this.version += 1;
    }
    
    // Create history entry with cleaned field values
    await mongoose.model('FieldValueHistory').create({
      batchRecord: this.batchRecord,
      batchRecordData: this._id,
      sectionName: this.sectionName,
      version: this.version,
      fieldsSnapshot: this.fields.map(field => ({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        fieldValue: field.fieldValue
      })),
      metadata: {
        userId: this._user?.id,
        userRole: this._user?.role,
        clientInfo: this._clientInfo
      }
    });
  }
  next();
});

const BatchRecordData = mongoose.models.BatchRecordData || mongoose.model('BatchRecordData', batchRecordDataSchema);

export default BatchRecordData;

