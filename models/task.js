const mongoose = require('mongoose')
const User = require('./user')
const taskSchema = new mongoose.Schema({
    todo:{
        type:String,
        required:true
    },
    username:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports  = mongoose.model('Task', taskSchema)