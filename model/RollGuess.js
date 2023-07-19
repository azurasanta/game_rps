const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RollGuessSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    bet_amount: {
        type: Number,
        required: true
    },
    host_roll: {
        type: Number,
        required: true
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

module.exports = RollGuess = mongoose.model('rps_roll_guesses', RollGuessSchema);
