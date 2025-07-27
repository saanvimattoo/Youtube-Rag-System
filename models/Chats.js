import { Schema, model, models } from 'mongoose';

const ChatSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'ai'],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = models.Chat || model('Chat', ChatSchema);

export default Chat;
