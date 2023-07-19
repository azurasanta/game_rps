const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameTypeSchema = new Schema({
  game_type_id: {
		type: Number,
		default: 0
	},
  game_type_name: {
    type: String,
    default: ''
  },
  short_name: {
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

module.exports = GameType = mongoose.model('rps_game_types', GameTypeSchema);
