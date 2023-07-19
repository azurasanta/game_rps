const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReceiptSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  payment_method: {
    type: String,
    default: 'Stripe'
  },
  email: {
    type: String,
    default: ''
  },
  payee_name: {
    type: String,
    default: ''
  },
  bank_account_number: {
    type: String,
    default: ''
  },
  bank_short_code: {
    type: String,
    default: ''
  },
  payment_type: {
    type: String,
    default: 'Deposit'
  },
  amount: {
    type: Number,
    default: 0
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

module.exports = Receipt = mongoose.model('rps_receipt', ReceiptSchema);
