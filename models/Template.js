import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  default: { type: mongoose.Schema.Types.Mixed },
  fieldType: { type: String, required: true, enum: ['text', 'float', 'int', 'date', 'checkbox'] }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  sectionDescription: { type: String, required: false }, // for future use
  order: { type: Number, required: true }, // order of the section
  fields: [fieldSchema]
}, { _id: false });

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: Number, required: true },
  structure: [sectionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// this sort the sections by order before saving it to the database
templateSchema.pre('save', function(next) {
  this.structure.sort((a, b) => a.order - b.order);
  next();
});

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

export default Template;