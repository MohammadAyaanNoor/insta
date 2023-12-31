const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/instaclone")


const userSchema = mongoose.Schema({
  username:String,
  fullname:String,
  DOB:String,
  password:String,
  followers:{
   ref:mongoose.Schema.Types.ObjectId,
   type:[]
  },
  following:{
    ref:mongoose.Schema.Types.ObjectId,
    type:[]
   },
   bio:String,
  likes:{
    type:[]
  },
  posts:{
    type:[]
  },
  profileImage:{
    type:String,
    default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIUhL2MIHICJzahAwO51QWQf2DOBezgf3YGA&usqp=CAU"
  }

})
userSchema.plugin(plm)
module.exports = mongoose.model("user", userSchema);