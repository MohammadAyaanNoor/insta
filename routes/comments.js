const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/instaclone")

const commentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    comment: { type: String},
    created_at: { type: Date, default: Date.now },
    likes:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user'
    }],
    

})

module.exports = mongoose.model("comment",commentSchema)