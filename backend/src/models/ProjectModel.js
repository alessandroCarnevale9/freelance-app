const mongoose = require(`mongoose`)
const { link } = require("../routes/user")

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    link: {
        type: String,
    },
    imageIds: {
        type: [String]
    }
})

module.exports = ProjectSchema