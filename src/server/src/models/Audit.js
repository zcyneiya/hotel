import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['submit', 'approve', 'reject', 'offline'],
    required: true
  },
  reason: String,
  previousStatus: String,
  newStatus: String
}, {
  timestamps: true
});

export default mongoose.model('Audit', auditSchema);
