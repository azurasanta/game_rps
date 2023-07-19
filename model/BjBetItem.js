const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BjBetItemSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    joiner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    bj: {
        type: String,
        default: '',
    },
    score: {
        type: Number,
        default: 0,
    },
    bj_list: {
        type: [String],
        default: []
    },
    bet_amount: {
        type: Number,
        default: 0
    },
    joiner_bj: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        defalut: ''
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

module.exports = BjBetItem = mongoose.model('rps_bj_bet_item', BjBetItemSchema);
