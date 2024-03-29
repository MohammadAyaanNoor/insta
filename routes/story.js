const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  story: {
    type:String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  }
  ],
 
})


module.exports = mongoose.model("story", storySchema);