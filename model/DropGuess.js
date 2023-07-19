const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DropGuessSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    bet_amount: {
        type: Number,
        required: true
    },
    host_drop: {
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

module.exports = DropGuess = mongoose.model('rps_drop_guesses', DropGuessSchema);
