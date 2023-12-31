const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/instaclone")

const postSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    caption: { type: String, default: '',required:true },
    image:{
        type:String
    },
    created_at: { type: Date, default: Date.now },
    likes: { type: Array, default: [] },

})

module.exports = mongoose.model("post",postSchema)