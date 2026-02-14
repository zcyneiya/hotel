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
  totalRooms: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  availableRooms: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    default: 2
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
      type: String,
      required: true
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
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'special'],
      default: 'percentage'
    },
    scenario: {
      type: String,
      enum: ['earlybird', 'lastminute', 'longstay', 'weekend', 'holiday', 'member', 'other'],
      default: 'other'
    },
    startDate: Date,
    endDate: Date
  }],
  nearby: {
    attractions: [{
      name: String,
      distance: String,
      type: {
        type: String,
        enum: ['scenic', 'museum', 'park', 'landmark', 'other']
      }
    }],
    transportation: [{
      name: String,
      distance: String,
      type: {
        type: String,
        enum: ['subway', 'bus', 'train', 'airport', 'other']
      }
    }],
    shopping: [{
      name: String,
      distance: String,
      type: {
        type: String,
        enum: ['mall', 'supermarket', 'market', 'other']
      }
    }]
  },
  nearbyAttractions: [String],
  isDeleted: {
    type: Boolean,
    default: false
  },
  offlineDate: {
    type: Date
  },
  offlineReason: String
}, {
  timestamps: true
});

// 索引
hotelSchema.index({ city: 1, status: 1 });
hotelSchema.index({ 'name.cn': 'text' });

export default mongoose.model('Hotel', hotelSchema);
