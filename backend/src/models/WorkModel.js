const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  announcementId: {
    type: String,
    required: true
  },
  workFileId: {
    type: String,
    required: true
    }
})

module.exports = mongoose.model('Work', workSchema);