const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QsBetItemSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    joiner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    qs: {
        type: String,
        default: '',
    },
    bet_amount: {
        type: Number,
        default: 0
    },
    joiner_qs: {
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

module.exports = QsBetItem = mongoose.model('rps_qs_bet_item', QsBetItemSchema);
