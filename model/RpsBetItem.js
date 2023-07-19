const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RpsBetItemSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    joiner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rps: {
        type: String,
        default: 'R',
    },
    rps_list: {
        type: [String],
        default: []
    },
    bet_amount: {
        type: Number,
        default: 0
    },
    joiner_rps: {
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

module.exports = RpsBetItem = mongoose.model('rps_rps_bet_item', RpsBetItemSchema);
