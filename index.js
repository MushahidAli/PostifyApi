const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();

app.use(cors());

mongoose.connect(process.env.mongodbString);
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) { console.log("connection succeeded"); })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(express.json());

//SIGNUP
app.get('/sign_up/:name/:email/:password/:personalContent', function (req, res) {

   var name = req.params.name;
   var email = req.params.email;
   var password = req.params.password;
   var personalContent = req.params.personalContent;

   var data = {
      name, email, password, personalContent
   }

   db.collection('postify_logon_collection').insertOne(data, function (err, collection) {
      if (err) throw err;
      console.log("Record inserted Successfully : " + collection);
   });
})

//VIEW-SIGNUP-DATA
app.get('/checkAvailibity/:id', async function (req, res) {
   var answer = await db.collection('postify_logon_collection').findOne({ email: req.params['id'] }, function (err, collection) {
      if (err) throw err;
      console.log(collection)
      return collection;
   });
   if(answer) {res.send(answer);}
   else {res.send({email: 'No', description: 'No Such Email Address Present In The Database!'});}
   res.end();
})

//SIGNIN
app.get('/sign_in/:email/:password', async function (req, res) {

   var answer = await db.collection('postify_logon_collection').findOne({ email: req.params['email'], password: req.params['password'] }, function (err, collection) {
      if (err) throw err;
      console.log(collection)
      return collection;
   });
   if (answer) {
      res.json({ auth: 'success' });
   }
   else {
      res.json({auth: 'failure'});
   }
   res.end();

})

//POSTING-DATA
app.get('/addpost/:newid/:user/:post/:dateandtime/:personalcontent', function (req, res) {

   var newid = req.params.newid;
   var user = req.params.user;
   var post = req.params.post;
   var dateandtime = req.params.dateandtime;
   var personalcontent = req.params.personalcontent;

   var data = {
      newid, user, post, dateandtime, personalcontent
   }

   db.collection('postify_post_collection').insertOne(data, function (err, collection) {
      if (err) throw err;
      console.log("Record inserted Successfully : " + collection);
   });
   res.end();
})

//VIEWING-DATA
app.get('/viewpost/:email/:limit', async function (req, res) {

   var answer = await db.collection('postify_post_collection').find({ user: req.params['email']}, function (err, collection) {
      if (err) throw err;
      console.log(collection)
      return collection;
   }).sort({_id:-1}).limit(parseInt(req.params['limit'])).toArray();
   if (answer) {
      res.send(answer);
   }
   res.end();

})

//VIEWING-ALL-POST
app.get('/viewallpost/:limit', async function (req, res) {

   var answer = await db.collection('postify_post_collection').find({}, function (err, collection) {
      if (err) throw err;
      console.log(collection)
      return collection;
   }).sort({_id:-1}).limit(parseInt(req.params['limit'])).toArray();
   if (answer) {
      res.send(answer);
   }
   res.end();

})

//HOW-MANY-POSTS
app.get('/howmanyposts/:id', async function (req, res) {

   var answer = await db.collection('postify_post_collection').countDocuments({ user: req.params['id']}, function (err, collection) {
      if (err) throw err;
      console.log(collection)
      return collection;
   });
   if (answer) {
      res.json({posts: answer})
   }
   else {
      res.json({posts: 0});
   }
   res.end();

})

//NUMBER-OF-ALL-POSTS
app.get('/numberofallposts/', async function (req, res) {

   var answer = await db.collection('postify_post_collection').countDocuments({}, function (err, collection) {
      if (err) throw err;
      console.log(collection)
      return collection;
   });
   if (answer) {
      res.json({posts: answer})
   }
   else {
      res.json({posts: 0});
   }
   res.end();

})

//DELETING-POST
app.get('/deletepost/:id', async function(req, res) {
   var answer = await db.collection('postify_post_collection').deleteOne({newid: req.params['id']},function(err, collection){
      if (err) throw err;
      console.log(collection)
      return collection;
   });
   res.send(answer);
   res.end();
})

//DELETING-ACCOUNT
app.get('/delete/:id', async function(req, res) {
   var answer = await db.collection('postify_logon_collection').deleteOne({email: req.params['id']},function(err, collection){
      if (err) throw err;
      console.log(collection)
      return collection;
   });
   res.send(answer);

   var answerOne = await db.collection('postify_post_collection').deleteMany({user: req.params['id']},function(err, collection){
      if (err) throw err;
      console.log(collection)
      return collection;
   });

   res.end();
})

app.listen(process.env.PORT || 3000);