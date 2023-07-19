const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChangePasswordRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = ChangePasswordRequest = mongoose.model('rps_change_password_request', ChangePasswordRequestSchema);
