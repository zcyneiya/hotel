import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  facilities: [String],
  images: [String],
  description: String
});

const hotelSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    cn: {
      type: String,
      required: true
    },
    en: {
      type: String
    }
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  starLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  facilities: [String],
  images: [String],
  rooms: [roomSchema],
  openDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'offline'],
    default: 'draft'
  },
  rejectReason: String,
  promotions: [{
    title: String,
    description: String,
    discount: Number,
    startDate: Date,
    endDate: Date
  }],
  nearbyAttractions: [String],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引
hotelSchema.index({ city: 1, status: 1 });
hotelSchema.index({ 'name.cn': 'text' });

export default mongoose.model('Hotel', hotelSchema);
