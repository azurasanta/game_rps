const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameLogSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    joined_user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    game_type: {
        type: Schema.Types.ObjectId,
        ref: 'GameType'
    },
    bet_amount: {
        type: Number,
        default: 0
    },
    selected_rps: {
        type: String,
        default: ''
    },
    selected_roll: {
        type: String,
        default: ''
    },
    selected_dg: {
        type: String,
        default: ''
    },
    selected_qs_position: {
        type: Number,
        default: 0
    },
    game_result: {
        type: Number,
        default: 0
    },
    selected_box: {
        type: Schema.Types.ObjectId,
        ref: 'RoomBoxPrize',
        default: null
    },
    brain_game_score: {
        type: Number,
        default: 0
    },
    selected_drop: {
        type: Number,
        default: 0
    },
    cashoutAmount: {
        type: Number,
        default: 0
    },
    multiplier: {
        type: Number,
        default: 0
    },
    new_host_pr: {
        type: Number,
        default: 0
    },
    host_pr: {
        type: Number,
        default: 0
    },
    user_bet: {
        type: Number,
        default: 0
    },
    is_anonymous: {
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

module.exports = GameLog = mongoose.model('rps_game_logs', GameLogSchema);
