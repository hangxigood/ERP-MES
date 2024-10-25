import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  operationType: {
    type: String,
    enum: ['insert', 'update', 'delete', 'replace'],
    required: true
  },
  collectionName: {
    type: String,
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  fullDocument: {
    type: mongoose.Schema.Types.Mixed
  },
  updateDescription: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    userId: mongoose.Schema.Types.ObjectId,
    userRole: String,
    clientInfo: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  // Use strict: false to allow flexible document structure
  strict: false 
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
