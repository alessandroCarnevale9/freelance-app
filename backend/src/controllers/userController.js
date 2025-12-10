const User = require('../models/UserModel')

const ApiError = require(`../utils/ApiError`)
const bcrypt = require(`bcrypt`)

// signup user
// const createUser = async (req, res) => {

//     // da aggiungere altri campi come Nome, Cognome ecc...
//     const { email, password, role } = req.body

//     // validazione dei campi usando il middleware userValidation.js...

//     const existing = await User.findOne({
//         email: email.toLowerCase().trim()
//     }).exec()

//     if(existing)
//         throw new ApiError(409, `User with email ${email} already exists.`)

//     // password hash
//     const salt = await bcrypt.genSalt(10)
//     const passwordHash = await bcrypt.hash(password, salt)

//     try {
//         const user = await User.create({ email, password: passwordHash, role})
//         res.status(201).json({ user /*,access token*/ })
//     } catch (error) {
//         res.json({ error: error.message })
//     }
// }



const deleteUser = async (req, res) => {
    const { id } = req.params

    if(!id)
        throw new ApiError(400, `User id is missing.`)

    const targetUser = await User.findById(id).exec()
    if(!targetUser)
        throw new ApiError(404, `User not found.`)

    // *** aggiungere controlli su chi fa cosa... ***

    await targetUser.deleteOne()
    res.json({ message: 'User successfully deleted.' })
}


module.exports = {
    // getUser, updateUser (se necessarie) ...
    // createUser,
    deleteUser
}
