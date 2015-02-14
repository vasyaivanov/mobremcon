var express = require('express')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')                                
  , session = require('express-session')
  , methodOverride = require('method-override')
  , flash = require('connect-flash')
  , fs = require('fs')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy
  , mongodb = require('mongodb')
  , mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , path = require('path')
  , SALT_WORK_FACTOR = 10;

var app = express();               
module.exports.app = app;

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


var expressLogFile = fs.createWriteStream('./expressLogFile.log', {flags: 'w'}); //use {flags: 'w'} to open in write mode

// find path www_dir to index.html							
var indexHtml = 'index.html';								
var awsDir = '/home/ec2-user/www/';							
var localDir = __dirname + "/../";							
var www_dir;												
if (fs.existsSync(path.join(localDir, indexHtml))) {					
  www_dir = localDir;										
} else {													
  www_dir = awsDir;											
}
www_dir = path.normalize(www_dir);
					
// hash redirection											
var slitesDir = "slites";
var slitesReg = "[0-9a-zA-Z]{4}";

// configure Express
app.set('port', 8081);//process.env.PORT || 
app.set('view engine', 'ejs');//'html'
app.set('views', www_dir);
app.engine('.html', require('ejs').renderFile);
app.set("view options", {layout: false});
app.use(logger('dev', { stream: expressLogFile }));                             
app.use(cookieParser());                                                        
app.use(bodyParser.json());                                                     
app.use(bodyParser.urlencoded({ extended: true }));                             
app.use(methodOverride());                                                      
app.use(session({                                                               
    secret: 'abrakadabra',
    resave: false,
    saveUninitialized: false
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// middleware do retrieve slites files from /slites folders
var slitesRegMW = new RegExp('^\\/' + slitesReg + '(\\/|$)');
app.use(function (req, res, next) {
    var match = req.url.match(slitesRegMW);
    if (match) {
        //console.log('URL: url=' + req.url);
        req.url = '/' + slitesDir + req.url;
        //console.log('REPLACED WITH: ' + req.url + '\n');
    }
    next();
});

// ROUTES
var router = express.Router();

// remote
//router.get('/remote/:slite_path?', function (req, res) {
//    console.log('remote: ' + req.params.slite_path);
//});

var rootRegExp = new RegExp('^/($|index(\.html)?$)');
router.get(rootRegExp, function (req, res){
  //console.log('ROOT: ' + req.url + ' RegExp: ' + rootRegExp);               
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  res.render(path.join(www_dir, indexHtml), { user: req.user });				
});

router.get('/account', ensureAuthenticated, function (req, res){
    //console.log('get /account');
    res.render(path.join(www_dir, 'account.html'), { user: req.user });
});

router.post('/signup', function (req, res){
  //console.log('post /signup');
  console.log("MA: new user: " + req.body.username + " " + req.body.password + " " + req.body.email);
  if( !req.body.username || !req.body.password || !req.body.email ) res.redirect('/signup.html');
  else
  {
	addUser(req.body.username, req.body.password, req.body.email);
	res.redirect('/login');
  }
});

router.get('/login', function (req, res){
    //console.log('get /login');
    res.render(path.join(www_dir, 'signin.html'), { user: req.user, message: req.flash('error') });
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/signin.html', failureFlash: true }),
  function (req, res) {
      //console.log('post /login');
	  console.log("MA: login2: " + req.user.username + " " + req.user.password + " " + req.user.email);
    res.redirect('/');
  });

router.get('/logout', function (req, res){
  //console.log('get /logout');
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

app.use('/', router);

app.use(express.static(www_dir));
//app.use(express.static(path.join(www_dir, 'static/')));


// ERROR HANDLING
// custom 404 page
app.use(function (req, res) {                                                   //4
    console.log('404: ' + req.url);
    res.type('text/html');
    res.status(404);
    res.send('<h1>404 - Not Found</h1>');
});

// custom 500 page
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {                                     //4
        console.error(err.stack);
        res.status(err.status || 500);
        res.type('text/html');
        res.send('<h1>500 - Server Error</h1>');
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {                                        //4
    res.status(err.status || 500);
    res.type('text/html');
    res.send('<h1>500 - Server Error</h1>');
});


// APP LISTEN
var http = require('http').createServer(app).listen(app.get('port'), function () {
    console.log('Server listening on port: ' + app.get('port'));
});

var io = require('socket.io').listen(http, { log: true });
module.exports.io = io;

require("./lib/socketio-slite.js").setDir(www_dir, slitesDir, slitesReg, function () { });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
