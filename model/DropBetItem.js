const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DropBetItemSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    joiner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    drop: {
        type: Number,
        default: 0,
    },
    drop_list: {
        type: [String],
        default: []
    },
    bet_amount: {
        type: Number,
        default: 0
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

module.exports = DropBetItem = mongoose.model('rps_drop_bet_item', DropBetItemSchema);
