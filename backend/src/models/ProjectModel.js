const mongoose = require(`mongoose`)
const { link } = require("../routes/user")

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