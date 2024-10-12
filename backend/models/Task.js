const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  taskName: { type: String, required: true },
  time: { type: Date, required: true },
  category: { type: String, required: true }, 
  user: {type: String, required: true},
  completionType: {
    type: String,
    enum: ['live', 'timeup', 'completed'],
    required: true,
  },
  hasFlexibleTime: {type: Boolean,  default: false}
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
