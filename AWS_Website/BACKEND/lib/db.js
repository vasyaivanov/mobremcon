var mongodb = require('mongodb')
, mongoose = require('mongoose')
, bcrypt = require('bcryptjs')
, mongooserand = require('mongoose-simple-random')
, SALT_WORK_FACTOR = 10
;


mongoose.connect('localhost', 'test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});


// User Schema
var userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true},
  password: { type: String, required: true},
  role: {type: Number},
  domain: {type: String, lowercase: true}
});

userSchema.plugin(mongooserand);

userSchema.index({email: 1}, {unique: true});

// Bcrypt middleware
userSchema.pre('save', function(next) {
  var user = this;
  if(!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};


// Notes
var notesSchema = mongoose.Schema({
  uid: { type: String},
  sid: { type: String},
  note: { type: String},
  tmp: {type: String},
  created: { type: Date },
  updated: { type: Date }
});

notesSchema.pre('save', function(next){
  now = new Date();
  this.created = now;
  this.updated = now;
  next();
});

notesSchema.index({uid: 1, sid: 1}, {unique: true});


// Chat
var chatSchema = mongoose.Schema({
  uid: { type: String},
  sid: { type: String},
  name: { type: String},
  msg: { type: String},
  created: { type: Date }
});

chatSchema.pre('save', function(next){
  now = new Date();
  this.created = now;
  next();
});


// Billing
var billingSchema =  mongoose.Schema({
  txn_id: { type: String, trim: true},
  account_type: {type: String, trim: true},
  uid: {type: String, trim: true},
  payment_gross: {type: Number},
  payment_status: {type: String, trim: true},
  payment_date: {type: Date},
  activated: {type: Number, default: 0 }
});

billingSchema.index({txn_id: 1, payment_status: 1, payment_gross: 1}, {unique: true});


var videoUploadsSchema =  mongoose.Schema({
  sid: {type: String},
  opentokId : {type: String},
  archid: {type: String},
  created: { type: Date }
});

videoUploadsSchema.pre('save', function(next){
  now = new Date();
  this.created = now;
  next();
});


// User subscription
var subscriptionSchema =  mongoose.Schema({
  uid: { type: String, trim: true, required: true},
  end_date: {type: Date, required: true}
});

subscriptionSchema.index({uid: 1}, {unique: true});

// SlidesDB
var slidesSchema = mongoose.Schema({
  uid: { type: String, required: true},
  sid: { type: String, required: true},
  scid: { type: String},
  title: { type: String},
  size: { type: Number, required: true},
  tmp: {type: String, default: 1},
  created: { type: Date },
  crawled: { type: Number,  default: 0 },
  url: {type: String},
  desc: { type: String },
  site: { type: String },
  keywords: { type: String },
  password: { type: String },
  paypalTransaction: { type: String },
  paypalTmpExp: { type: Date },
  paypalPayed: { type: Number, max: 1, default: 0,  },
  isVideoChatOpen: { type: Number,  default: 0,  max: 1 },
  isScreensharingOpen: { type: Number,  default: 0,  max: 1 },
  isOnlinePresentation: { type: Number,  default: 0,  max: 1 },
  hidden: { type: Number,  default: 0 , max: 1},
  domainSet: {type: Number,  default: 0 , max: 1 },
  notPTPVideo: { type: Number,  default: 0 , max: 1},
  slidesNum: {type: Number},
  videoSession: {type: String},
  lastArchiveId: {type: String},
  presentationKey: {type: Number},
  meeting: {type: Number, default:0 , max: 1},
  viewsCount: { type: Number,  default: 0 },
});

slidesSchema.plugin(mongooserand);

slidesSchema.pre('save', function(next){
  now = new Date();
  this.created = now;
  if ( !this.created ) {
    this.created = now;
  }
  next();
});

slidesSchema.index({uid: 1, sid: 1}, {unique: true});


var Slide = mongoose.model('slide', slidesSchema);

// Removing videosessions
Slide.update({   }, { $unset: {videoSession: ""}}, {multi: true}, function(errU, docU) {
  if(errU || !docU)
    console.error("Can not flush old video sessions");
  else
    console.log("Old video session were removed")
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Note: mongoose.model('note', notesSchema),
  Chat: mongoose.model('chat', chatSchema),
  Billing: mongoose.model('billing', billingSchema),
  VideoUploads: mongoose.model('upload', videoUploadsSchema),
  Subscription: mongoose.model('subscription', subscriptionSchema),
  Slide: Slide
}
