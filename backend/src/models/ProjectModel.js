const mongoose = require(`mongoose`)

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String
    },
    link: {
        type: String,
    },
    imageIds: {
        type: [String]
    }
})

module.exports = ProjectSchema