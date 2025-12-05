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
    projects: {
        type: [ProjectSchema],
        default: [],
        validate: {
            validator: function(projects) {
                if(!projects || projects.length === 0) return true;
                return projects.every(p => {
                    const hastTitle = typeof p.title === 'string' && p.title.trim() !== '';
                    const hasDescription = typeof p.description === 'string' && p.description.trim() !== '';
                    return hastTitle && hasDescription;
                })
                message: 'Ogni progetto deve avere title e description quando viene fornito' 
            }
        }
    }
})

module.exports = mongoose.model('User', userSchema)
