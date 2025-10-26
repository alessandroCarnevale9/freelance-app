const mongoose = require(`mongoose`)

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
