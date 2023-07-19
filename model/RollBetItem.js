const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RollBetItemSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    roll: {
        type: Number,
        default: 0,
    },
    face: {
        type: String,
        default: '',
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

module.exports = RollBetItem = mongoose.model('rps_roll_bet_item', RollBetItemSchema);
