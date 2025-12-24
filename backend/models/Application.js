import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  schemeId: {
    type: String,
    required: true,
    index: true
  },
  schemeName: {
    type: String,
    required: true
  },
  applicationId: {
    type: String,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'documents_required'],
    default: 'draft',
    index: true
  },
  applicantInfo: {
    name: String,
    age: Number,
    income: Number,
    category: String,
    state: String,
    district: String,
    occupation: String,
    phone: String,
    email: String
  },
  documents: [{
    type: {
      type: String,
      required: true
    },
    name: String,
    url: String,
    uploadedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }],
  timeline: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  rejectionReason: String,
  approvalDate: Date,
  expiryDate: Date,
  benefits: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Generate unique application ID
applicationSchema.pre('save', async function(next) {
  if (!this.applicationId) {
    const prefix = this.schemeId.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.applicationId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Add to timeline on status change
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      message: `Application status changed to ${this.status}`,
      timestamp: new Date()
    });
  }
  next();
});

export default mongoose.model('Application', applicationSchema);
