const mongoose = require(`mongoose`)
const ProjectSchema = require(`./ProjectModel`)

const Schema = mongoose.Schema

const userSchema = new Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    nickname: {
        required: true,
        type: String,
    },
    role: {
        require: true,
        type: String,
        enum: ['CLIENT','FREELANCER'],
        default: 'CLIENT'
    },
    titles: {
        type: [String]
    },
    keySkills: {
        type: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    projects: [ProjectSchema]
})

module.exports = mongoose.model('User', userSchema)
