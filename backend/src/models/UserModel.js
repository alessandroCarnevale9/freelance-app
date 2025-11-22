const mongoose = require(`mongoose`)

const Schema = mongoose.Schema

const userSchema = new Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    nickname: {
        type: String,
    },
    role: {
        type: String,
        enum: ['CLIENT','FREELANCER'],
        default: 'CLIENT'
    },
    isActive: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('User', userSchema)
