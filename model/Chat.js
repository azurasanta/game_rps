const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
  },
  messageType: {
    type: String,
    enum: ['text', 'gif'], // Add more types if needed
    default: 'text'
  },
  messageContent: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    ref: 'User.avatar'
  },
  replyTo: [
    {
      sender: {
        type: Schema.Types.ObjectId,
    ref: 'User'
      },
      avatar: {
        type: String
      },
      message: {
        type: String
      },
      messageType: {
        type: String
      },
      time: {
        type: String
      }
    }
  ]
});

module.exports = Chat = mongoose.model('rps_chat', ChatSchema);