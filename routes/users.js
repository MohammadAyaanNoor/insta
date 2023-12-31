const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/instaclone")


const userSchema = mongoose.Schema({
  username:String,
  fullname:String,
  DOB:String,
  password:String,
  followers:[{
   type:mongoose.Schema.Types.ObjectId,
   ref:"user"
  }],
  following:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
   }],
   bio:String,
  likes:{
    type:[]
  },
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
  profileImage:{
    type:String,
    default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIUhL2MIHICJzahAwO51QWQf2DOBezgf3YGA&usqp=CAU"
  }

})
userSchema.plugin(plm)
module.exports = mongoose.model("user", userSchema);