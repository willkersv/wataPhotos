const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', albumSchema);