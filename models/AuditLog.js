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

auditLogSchema.statics.createAuditLog = async function(
  operation, 
  document, 
  userId, 
  userRole, 
  clientInfo,
  additional = {}
) {
  try {
    await this.create({
      operationType: operation,
      collectionName: document.constructor.modelName,
      documentId: document._id,
      timestamp: new Date(),
      fullDocument: document.toObject(),
      updateDescription: additional.updateDescription,
      metadata: {
        userId,
        userRole,
        clientInfo
      }
    });
    console.log('Audit log created successfully');
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
};

const getDiff = (oldDoc, newDoc) => {
  const changes = {};
  const oldObj = oldDoc?._doc || oldDoc;
  const newObj = newDoc?._doc || newDoc;

  // Skip these fields in the diff
  const skipFields = ['updatedAt', '__v'];

  // Special handling for fields array
  if (oldObj?.fields && newObj?.fields) {
    const fieldsChanges = [];
    
    // Check if it's a multi-column structure (like the table)
    const isMultiColumn = newObj.fields[0]?.fieldValue.length > 1;

    if (isMultiColumn) {
      // Handle multi-column structure (existing logic)
      const labels = newObj.fields[0]?.fieldValue || [];

      for (let i = 1; i < newObj.fields.length; i++) {
        const oldField = oldObj.fields[i];
        const newField = newObj.fields[i];
        
        if (JSON.stringify(oldField?.fieldValue) !== JSON.stringify(newField?.fieldValue)) {
          const valueChanges = [];
          for (let j = 0; j < newField.fieldValue.length; j++) {
            if (oldField.fieldValue[j] !== newField.fieldValue[j] && 
                newField.fieldValue[j] !== "") {
              valueChanges.push({
                sectionName: newObj.sectionName,
                label: `${labels[j] || 'Row'} (${j + 1})`,
                fieldName: newField.fieldName,
                old: oldField.fieldValue[j],
                new: newField.fieldValue[j],
                rowIndex: j + 1
              });
            }
          }
          if (valueChanges.length > 0) {
            fieldsChanges.push(...valueChanges);
          }
        }
      }
    } else {
      // Handle single-column structure (like checkboxes)
      for (let i = 0; i < newObj.fields.length; i++) {
        const oldField = oldObj.fields[i];
        const newField = newObj.fields[i];
        
        if (JSON.stringify(oldField?.fieldValue) !== JSON.stringify(newField?.fieldValue)) {
          fieldsChanges.push({
            sectionName: newObj.sectionName,
            label: newField.fieldName,
            fieldName: 'Value',
            old: oldField.fieldValue[0],
            new: newField.fieldValue[0],
            rowIndex: i + 1
          });
        }
      }
    }
    
    if (fieldsChanges.length > 0) {
      changes.fields = fieldsChanges;
    }
  }

  // Handle other top-level fields
  Object.keys(newObj || {}).forEach(key => {
    if (skipFields.includes(key) || key === 'fields') return;
    
    if (JSON.stringify(oldObj?.[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = {
        old: oldObj?.[key],
        new: newObj[key]
      };
    }
  });

  return Object.keys(changes).length ? changes : null;
};

// Example middleware for any schema that needs auditing
export const addAuditLogMiddleware = (schema) => {
  // Store original document before update
  schema.pre('save', async function(next) {
    if (!this.isNew) {
      // Store complete original document
      const original = await this.constructor.findOne({ _id: this._id });
      this._original = original ? original.toObject() : null;
    }
    next();
  });

  // After save middleware to create audit log
  schema.post('save', async function(doc) {
    try {
      if (this.isNew) {
        await mongoose.model('AuditLog').createAuditLog(
          'insert',
          doc,
          this._user?.id,
          this._user?.role,
          this._clientInfo
        );
      } else {
        const changes = getDiff(this._original, this);
        if (changes) {
          console.log('Detected changes:', changes); // Debug log
          await mongoose.model('AuditLog').createAuditLog(
            'update',
            doc,
            this._user?.id,
            this._user?.role,
            this._clientInfo,
            { updateDescription: changes }
          );
        }
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  });

  // Handle deletion
  schema.pre('remove', async function(next) {
    try {
      await mongoose.model('AuditLog').createAuditLog(
        'delete',
        this,
        this._user?.id,
        this._user?.role,
        this._clientInfo
      );
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
    next();
  });
};

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
