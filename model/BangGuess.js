const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BangGuessSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    bet_amount: {
        type: Number,
        required: true
    },
    host_bang: {
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

module.exports = BangGuess = mongoose.model('rps_bang_guesses', BangGuessSchema);
