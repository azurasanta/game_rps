const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    question: {
        type: Schema.Types.ObjectId,
        ref: 'Question'
    },
    answer: {
        type: String,
        default: ''
    },
    brain_game_type: {
        type: Schema.Types.ObjectId,
        ref: 'BrainGameType',
        default: null
    },
    is_correct_answer: {
        type: Boolean,
        default: true
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

module.exports = Answer = mongoose.model('rps_answers', AnswerSchema);
