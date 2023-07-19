const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrainGameTypeSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    game_type_name: {
        type: String,
        default: ''
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

module.exports = BrainGameType = mongoose.model('rps_brain_game_types', BrainGameTypeSchema);
