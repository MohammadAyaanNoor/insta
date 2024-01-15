var express = require('express');
var router = express.Router();
const usermodel = require('./users')
const postmodel = require('./posts')
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


  res.render('feed', {footer: true,posts,loggedinUser});
});
router.get("/likePost/:postId",isloggedin, async function(req,res,next){
  const likedPost = await postmodel.findById(req.params.postId) 
  const liked = likedPost.likes.includes(req.user._id)

  if(liked){
    likedPost.likes.splice(likedPost.likes.indexOf(req.user._id),1)
  }else{
    likedPost.likes.push(req.user._id)
  }
  await likedPost.save()

  res.send("responce recorded")
  
})

router.get('/profile', isloggedin, async function(req, res) {
  var loggedinUser = await usermodel.findOne({username:req.session.passport.user}).populate('posts')
  res.render('profile', {footer: true,loggedinUser});
});

router.get('/search', isloggedin, function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit', isloggedin, function(req, res) {
  res.render('edit', {footer: true});
});

router.get('/upload', isloggedin, function(req, res) {
  res.render('upload', {footer: true});
});
router.post('/upload', isloggedin, upload.single('file'), async function(req, res) {
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
