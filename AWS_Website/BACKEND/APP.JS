var flash = require('connect-flash')
  , express = require('express3')
  , fs = require('fs')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy
  , mongodb = require('mongodb')
  , mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10;

mongoose.connect('localhost', 'test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

// User Schema
var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
});

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

var User = mongoose.model('User', userSchema);

function addUser(username, password, email) {
	console.log("MA: new user2: " + username + " " + password + " " + email);
  // Seed a user
  var user = new User({ username: username, email: email, password: password });
  user.save(function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log('user: ' + user.username + " saved.");
    }
  });
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

var app = express();

var expressLogFile = fs.createWriteStream('./expressLogFile.log', {flags: 'w'}); //use {flags: 'w'} to open in write mode

// configure Express
var www_dir = '/home/ec2-user/www';
//var www_dir = __dirname + "/../";
app.configure(function() {
  app.set('views', www_dir);
  app.set('view engine', 'ejs');
  app.engine('.html', require('ejs').renderFile);
  app.set("view options", {layout: false});
  app.use(express.logger({stream: expressLogFile}));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(www_dir));
});


app.get('/', function(req, res){
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  res.render('index.html', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account.html', { user: req.user });
});

app.post('/signup', function(req, res){
  console.log("MA: new user: " + req.body.username + " " + req.body.password + " " + req.body.email);
  if( !req.body.username || !req.body.password || !req.body.email ) res.redirect('/signup.html');
  else
  {
	addUser(req.body.username, req.body.password, req.body.email);
	res.redirect('/login');
  }
});

app.get('/login', function(req, res){
  res.render('signin.html', { user: req.user, message: req.flash('error') });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/signin.html', failureFlash: true }),
  function(req, res) {
	  console.log("MA: login2: " + req.user.username + " " + req.user.password + " " + req.user.email);
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  req.session.destroy(function (err) {
    if (err) {
      console.log("MA: logout error: " + err);
      res.redirect('/logout');
    }
    // The response should indicate that the user is no longer authenticated.
    //req.session.user = null;
    res.clearCookie('connect.sid', { path: '/' });
    console.log("MA: logout success ");
    res.redirect('/');
  });
});

app.listen(8081);

module.exports.app = app;

require("./lib/socketio-slite.js");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
