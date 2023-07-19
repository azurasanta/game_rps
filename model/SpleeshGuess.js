const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpleeshGuessSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    bet_amount: {
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

module.exports = SpleeshGuess = mongoose.model('rps_spleesh_guesses', SpleeshGuessSchema);
