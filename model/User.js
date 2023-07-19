const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rewards: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  referralId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rewards: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
  },
  avatar: {
    type: String
  },
  balance: {
    type: Number,
    default: 0
  },
  status: { type: String },
  is_deleted: {
    type: Boolean,
    default: false
  },
  verification_code: {
    type: String,
    default: ''
  },
  is_activated: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('rps_users', UserSchema);
