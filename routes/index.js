var express = require('express');
var router = express.Router();
const usermodel = require('./users')
const postmodel = require('./posts')
const commentmodel = require('./comments')
const utils = require('../utils/utils')
var passport = require('passport')
var localStrategy = require('passport-local');
const upload = require('./multer');
passport.use(new localStrategy(usermodel.authenticate()))


router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed', isloggedin, async function(req, res) {
  var loggedinUser = await usermodel.findOne({username:req.session.passport.user})
  const posts = await postmodel.find().populate('user')


  res.render('feed', {footer: true,posts,loggedinUser,dater:utils.formatRelativeTime});
});
router.get("/like/:postId",isloggedin, async function(req,res,next){
  const post = await postmodel.findOne({_id:req.params.postId}) 
  const loggedinUser =  await usermodel.findOne({username:req.session.passport.user})
  

  if(post.likes.indexOf(loggedinUser._id) !== -1){
    post.likes.splice(post.likes.indexOf(loggedinUser._id),1)
  }else{
    post.likes.push(loggedinUser._id)
  }
  await post.save()
  res.json(post)

  
  
})

router.get('/profile', isloggedin, async function(req, res) {
  var loggedinUser = await usermodel.findOne({username:req.session.passport.user}).populate('posts')
  res.render('profile', {footer: true,loggedinUser});
});

router.get('/search', isloggedin, function(req, res) {
  const loggedinUser = req.user
  res.render('search', {footer: true,loggedinUser});
});
router.get("/search/:username",isloggedin, async function(req,res){
  const searchTerm = `^${req.params.username}`;
  const regex = new RegExp(searchTerm);

  let users = await usermodel.find({ username: { $regex: regex } });

  res.json(users)
} )
router.get('/profile/:user',isloggedin, async (req, res) => {
  let loggedinUser = await usermodel.findOne({ username: req.session.passport.user });

  if (loggedinUser.username === req.params.user) {
    res.redirect("/profile");
  }

  let userprofile = await usermodel
    .findOne({ username: req.params.user })
    .populate("posts");

  res.render("userprofile", { footer: true, userprofile, loggedinUser });
});
router.get('/follow/:userid',isloggedin, async (req, res) => {
  const loggedinUser = await usermodel.findOne({username:req.session.passport.user})
  const followhonewaalauser = await usermodel.findOne({_id:req.params.userid})

  if(loggedinUser.following.indexOf(followhonewaalauser._id) === -1){
    loggedinUser.following.push(followhonewaalauser._id)
    followhonewaalauser.followers.push(loggedinUser._id)
  }
  else{
    loggedinUser.following.splice(loggedinUser.following.indexOf(followhonewaalauser._id),1)
    followhonewaalauser.followers.splice(followhonewaalauser.followers.indexOf(loggedinUser._id),1)
  }

  await loggedinUser.save()
  await followhonewaalauser.save()
  
  res.redirect('back')
});
router.get('/followers',isloggedin, async (req, res) => {
  const followers = await usermodel.findOne({username:req.session.passport.user}).populate('followers')
  res.render('followers',{followers})
});
router.get('/following',isloggedin, async (req, res) => {
  const following = await usermodel.findOne({username:req.session.passport.user}).populate('following')
  res.render('following',{following})
});
router.get('/removeFollowing/:userid',isloggedin,async(req,res)=>{
  const loggedinUser = await usermodel.findOne({username:req.session.passport.user})
  const removeUser = await usermodel.findOne({_id:req.params.userid})

  loggedinUser.following.splice(loggedinUser.following.indexOf(removeUser._id),1)
  removeUser.followers.splice(removeUser.followers.indexOf(loggedinUser._id),1)

  await loggedinUser.save()
  await removeUser.save()
  res.redirect('/following')
})
router.get('/removeFollower/:userid',isloggedin,async(req,res)=>{
  const loggedinUser = await usermodel.findOne({username:req.session.passport.user})
  const removeUser = await usermodel.findOne({_id:req.params.userid})

  loggedinUser.followers.splice(loggedinUser.followers.indexOf(removeUser._id),1)
  removeUser.following.splice(removeUser.following.indexOf(loggedinUser._id),1)

  await loggedinUser.save()
  await removeUser.save()
  res.redirect('/followers')
})
router.get('/bookmark/:postid', isloggedin, async (req, res) => {
  const loggedinUser = await usermodel.findOne({username:req.session.passport.user})
  if(loggedinUser.saved.indexOf(req.params.postid) === -1){
    loggedinUser.saved.push(req.params.postid)
  }
  else{
    loggedinUser.saved.splice(loggedinUser.saved.indexOf(req.params.postid),1)
  }

  await loggedinUser.save()
  res.status(200).json(loggedinUser)
});


router.get('/edit', isloggedin, async function(req, res) {
  const loggedinUser = await usermodel.findOne({username:req.session.passport.user})
  res.render('edit', {footer: true,loggedinUser});
});
router.post('/update',isloggedin,async (req, res) => {
  const loggedinUser = await usermodel.findOneAndUpdate(
    { username: req.session.passport.user },{
    username:req.body.username,
    fullname:req.body.name,
    bio:req.body.bio
  },{ new: true })

  req.login(loggedinUser, function (err) {
    if (err) throw err;
    res.redirect("/profile");
  });

});
// router.get('/comment', isloggedin, async function(req, res) {
//   var loggedinUser = await usermodel.findOne({username:req.session.passport.user})
//   const comments = await commentmodel.find().populate('user')
//   res.render('comment', {footer: true,loggedinUser,comments});
// });
// router.post('/postcomment', isloggedin, async function(req, res) {
//   const loggedinUser = await usermodel.findOne({username:req.session.passport.user})
//   const comment = await commentmodel.create({
//     user:loggedinUser._id,
//     comment:req.body.comment
//   })
//   loggedinUser.comments.push(comment._id)
//   await loggedinUser.save()
// });

router.get('/upload', isloggedin, function(req, res) {
  const loggedinUser = req.user
  res.render('upload', {footer: true,loggedinUser});
});
router.post('/upload',isloggedin,upload.single('file'),async (req,res)=>{
  // if(!req.file){
  //   return res.status(404).send("no files were given")
  // }
  const loggedinUser = await usermodel.findOne({username:req.session.passport.user})
  loggedinUser.profileImage = req.file.filename

  await loggedinUser.save()
  res.redirect('/edit')
})

router.post('/post', isloggedin, upload.single('file'), async function(req, res) {
  if(!req.file){
    return res.status(404).send("no files were given")
  }
  const loggedinuser = await usermodel.findOne({username:req.session.passport.user})
  const post = await postmodel.create({
    image:req.file.filename,
    caption:req.body.caption,
    user:loggedinuser._id
  })

  loggedinuser.posts.push(post._id)
  await loggedinuser.save()
  res.redirect('/profile')
});
router.post('/register', function(req, res) {
  var userdata = new usermodel({
    username:req.body.username,
    fullname:req.body.fullname,
    email:req.body.email
  })

  usermodel.register(userdata,req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
       res.redirect('/profile');
    })
  })
});
router.post('/login', passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/"

}),function(req,res) {
  
});
router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if(err){return next(err)}
    res.redirect('/')
  })
})
function isloggedin(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
}
module.exports = router;
