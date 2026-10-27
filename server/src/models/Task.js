const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [120, 'Task title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'review', 'done'],
        message: '{VALUE} is not a valid task status'
      },
      default: 'todo'
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority level'
      },
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    tags: {
      type: [String],
      default: []
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to an authenticated user'],
      index: true // Index for fast user-specific queries
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient user-specific status sorting and filtering
taskSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
