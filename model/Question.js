const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    question: {
        type: String,
        default: ''
    },
    brain_game_type: {
        type: Schema.Types.ObjectId,
        ref: 'BrainGameType',
        default: null
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

module.exports = Question = mongoose.model('rps_questions', QuestionSchema);
