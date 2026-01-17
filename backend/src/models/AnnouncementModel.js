const mongoose = require(`mongoose`)

const AnnouncementSchema = new mongoose.Schema({
    announcement: {
        type: String,
        required: true,
    },
    candidateAddress: {
        type: String,
        required: true
    }
})

AnnouncementSchema.pre('save', function (next) {
  if (this.candidateAddress) this.candidateAddress = this.candidateAddress.toLowerCase();
  next();
});

AnnouncementSchema.index({ announcement: 1, candidateAddress: 1 }, { unique: true });

module.exports = mongoose.model('AnnouncementCandidate', AnnouncementSchema);