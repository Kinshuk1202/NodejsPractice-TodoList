const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    todos:

        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }]


})
userSchema.statics.validateUser = async function (username, password) {
    const founduser = await this.findOne({ username })
    if (founduser) {
        const isValid = await bcrypt.compare(password, founduser.password)
        return isValid ? founduser : false;
    }
    return false;

}

module.exports = mongoose.model('User', userSchema)