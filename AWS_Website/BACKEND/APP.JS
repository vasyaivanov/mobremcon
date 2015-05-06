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
  , SALT_WORK_FACTOR = 10
  , appPort = 8081
  , ioPort = 1337
  , sessionIdCookie = "sliteCurrUser"
  , notesCookie = "slitenotesID";

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


// Notes
var notesSchema = mongoose.Schema({
  uid: { type: String},
  sid: { type: String},
  note: { type: String},
  tmp: {type: String}
});

notesSchema.index({uid: 1, sid: 1}, {unique: true});

var Note = mongoose.model('note', notesSchema);

// SlidesDB
var slidesSchema = mongoose.Schema({
  uid: { type: String},
  sid: { type: String},
  tmp: {type: String}
});

slidesSchema.index({uid: 1, sid: 1}, {unique: true});

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

function addUser(username, password, password_confirm, email, callback) {
   console.log("MA: new user2: " + username + " " + password + " " + email);
	
  // Seed a user
  var user = new User({ username: username, email: email, password: password });
  
   if(password != password_confirm) {
    	console.log("Password confirm error");
    	callback(4)
   }
 else {
  user.save(function(err) {
    if(err) {
	var err_code = 0;
	
	if (err.err.indexOf("username") > 0 ) {
	    err_code = 1;
	}
	else if( err.err.indexOf("email") > 0 ) {
	    err_code = 2;
	}
	else {
	    err_code = 3;
	}

	callback(err_code);
	
    } else {
     console.log('user: ' + user.username + " saved.");
     callback(0);
    }
  });
}

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
var www_static_dir = 'www_static';
var indexHtml = 'index.html';
var awsDir = '/home/ec2-user/www/';
var localDir = __dirname + "/../";
var www_dir;
if (fs.existsSync(path.join(localDir, www_static_dir, indexHtml))) {
    www_dir = localDir;
} else {
    www_dir = awsDir;
}
www_dir = path.normalize(www_dir);
console.log('www_dir: ' + www_dir);

// hash redirection
var slitesDir = "slites";
var slitesReg = "[0-9a-zA-Z]{4}";

// configure Express
app.set('port', appPort || process.env.PORT);
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

// middleware do render slites files from /slites folders
var slitesRegMW = new RegExp('^\\/' + slitesReg + '(\\/|$)');
app.use(function (req, res, next) {
    var match = req.url.match(slitesRegMW);
    if (match) {                                                        // if hash found in url
        if (req.url[req.url.length - 1] === '/') {
            req.url = req.url.slice(0, -1);
            //console.log("removed trailing slash");
        }
        //console.log('URL: "' + req.url + '"');
        var slashPos = req.url.indexOf('/', 1);
        //console.log('slashPos: ' + slashPos);
        var wwwSlites = path.join(www_dir, slitesDir);                  // www/slites/
        var hash = req.url.substring(1);
        var afterHash = '';                                             // all that is after hash
        if (slashPos !== -1) {                                          // something after second slash
            hash = req.url.substring(1, slashPos);
            afterHash = req.url.substring(slashPos + 1);
         }
        //console.log('hash: ' + hash);
        //console.log('afterHash: ' + afterHash);

        if (afterHash === '' ||
            afterHash.match(/^index($|\.html$|\.htm$)/)) {              // if nothing after hash or index.html (from slites/hash folder)
            var indexPathname = path.join(wwwSlites,
                                          hash,
                                          'index.html');                // www/slites/hash/index.html
            //console.log('RENDERING HTML: ' + indexPathname);
            res.render(indexPathname);
        } else if (afterHash.match(/^img[0-9]{1,6}\.jpg(\?ts=[0-9]+)?$/)) {  // img*.jpg files (from slites/hash folder)
            //console.log('jpg: ' + afterHash);
            var extTsPos = afterHash.indexOf('.jpg?ts=', 4);
            var jpgOptions = { lastModified: true, maxAge: 0 };
            if (extTsPos !== -1) {
                afterHash = afterHash.substring(0, extTsPos + 4);
                //console.log('ts-truncated jpg: ' + afterHash);
                jpgOptions.lastModified = false;
            }

            var jpgPathname = path.join(wwwSlites, hash, afterHash);    // www/slites/hash/img*.jpg
            //console.log('filePathname: ' + jpgPathname);
            res.sendFile(jpgPathname, jpgOptions, function (err) {
                if (err) {
                    console.log(err + ' sending file: ' + jpgPathname);
                }
            });
        } else {                                                        // all other files from www_static folder
            //console.log('file: ' + afterHash);
            var fileOptions = { lastModified: true, maxAge: 0, root: path.join(www_dir, www_static_dir) };

            var filePathname = path.normalize(afterHash);
            //console.log('filePathname: ' + filePathname);
            res.sendFile(filePathname, fileOptions, function (err) {
                if (err) {
                    console.log(err + ' sending file: ' + filePathname);
                }
            });
        }
        //console.log('\n');
    } else {
        next();
    }
});

// ROUTES
var router = express.Router();

// remote
//router.get('/remote/:slite_path?', function (req, res) {
//    console.log('remote: ' + req.params.slite_path);
//});

router.get('/socket.io/socket.io.js', function (req, res, next) {
    if (appPort === ioPort) {
        next();
    } else {
        var options = {
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        res.sendFile(path.join(www_dir, www_static_dir, '/js/socket.io-1.3.4.js'), options, function (err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            }
            else {
                //console.log('Sent: socket.io');
            }
        });
    }
})

var rootRegExp = new RegExp('^/($|index(\.html)?$)');
router.get(rootRegExp, function (req, res){

  //console.log('ROOT: ' + req.url + ' RegExp: ' + rootRegExp);
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  res.render(path.join(www_dir, www_static_dir, indexHtml), { user: req.user });
});

router.get('/account.html', ensureAuthenticated, function (req, res){
    res.render(path.join(www_dir, www_static_dir ,   'account.html'), { user: req.user });
});



router.get('/signup.html', function (req, res){
    //console.log('get /login');	
    res.render(path.join(www_dir,www_static_dir , 'signup.html'), { user: req.user, message: req.flash('error'), request: req,  error: 0});
});


router.post('/notes.html', function (req, res){

    res.type('text/html');
    res.status(200);
    var slideId = req.body.slideId;
    var noteText;
    var initialize = (req.body.initialize > 0) ? 1:0;

    slideId = slideId.replace(/[^a-zA-Z0-9]/g,"");

   // if(noteText) noteText = noteText.replace(/[^a-zA-Z0-9]/g,"");
    var slidePath = www_dir + slitesDir + '/' + slideId + '/';

    if(slideId == "A1") {
	slidePath = www_dir + www_static_dir + '/' + slideId;
    }


    var userId = 0;
    var oldUserId = 0;
    var tmpNote = 0;
 
    function findAremNote (callback) {
	   if(req.user && req.cookies[sessionIdCookie]) {
		if (req.user._id != req.cookies[sessionIdCookie]) {
			console.log("Removing old user ID cookie");
			oldUserId = req.cookies[sessionIdCookie];
			res.clearCookie(sessionIdCookie);
		}

		Note.find({ uid: oldUserId, tmp: 1 } , function (err, docs) {
			if (docs.length > 0 ) {
				var noteRet;
				if(req.body.noteText) {noteRet = req.body.noteText;}
				else {noteRet = docs[0].note;}
				Note.find({ uid: req.cookies[sessionIdCookie], tmp: 1 }).remove().exec();
				callback(noteRet,req.user._id);
			}
			else {
				callback("",req.user._id);
			}
		});

   	   }
	   else {
		callback("",req.cookies[sessionIdCookie]);
	   }

    }

   console.log("------------ note request start");

findAremNote(function(noteText,userId) {

if(!(noteText)) {    var noteText = req.body.noteText;}

if(!userId) {
    if(! req.cookies[sessionIdCookie]) {
	console.log("No cookie. Setting up a new cookie file");
	if(req.user) {
		console.log("New id is " + req.user._id);
		res.cookie(sessionIdCookie, req.user._id);
		userId = req.user._id;
	}
	else {
		tmpNote = 1;

		var userIpAddress = req.connection.remoteAddress

		userIpAddress = userIpAddress.replace(/\./g,"");

		var newId = Math.floor(Math.random() * (99999999999 - 1)) + 1 + userIpAddress + Math.round(+new Date()/1000);
		console.log("New id is " + newId);
		res.cookie(sessionIdCookie, newId);
		userId = newId;
	}
    }
    else {
	if(!req.user) {tmpNote = 1;}
	userId = req.cookies[sessionIdCookie];
	console.log("Cookie found");
    }
}
else {
	if(!req.user) {tmpNote = 1;}
}

    if(fs.existsSync(slidePath) == true && userId != '') {
	console.log('Slide was found');
	console.log('Your id is:' + userId);


	Note.find({uid : userId, sid: slideId }, function (err, docs) {
			if (!docs.length){
				console.log(' Inserting new note...');
				// Code 1 - added new note
				res.json({ "code": 1, "note": noteText })
				var note = new Note({uid: userId,sid: slideId, note: noteText, tmp: tmpNote});
				note.save(function(err, saved) {
						if(err) console.error('Can\'t insert a new note: ' + err);
					});
			}
			else {
				Note.update({ uid : userId, sid: slideId }, {$set: { note: noteText, tmp: tmpNote}}, {upsert: true},
					function (err, numAffected) {
  						if(numAffected > 0) {console.log("Updated rows: " + numAffected)}
					}
				);

				if(initialize == 1) {
					// Code 2 - Initialize
					console.log('Retrieving note from DB');
					res.json({"code": "2", "note": docs[0].note});
					console.log("------------ note request end");
				}
				else {
					// Code 3 - saved
					console.log('Updating note');
					res.json({"code": "3"});
					console.log("------------ note request end");
				}
			}
		});
    }
else {
	// Code 10 - slide was not found
	res.json({ "code": "10" })

	console.log("Slide was not found");
	console.log("------------ note request end");
}

});

  
});



router.post('/signup.html', function (req, res){
  //console.log('post /signup');
  console.log("MA: new user: " + req.body.username + " " + req.body.password + " " + req.body.email);
  if( !req.body.username || !req.body.password || !req.body.email ) res.redirect('/signup.html?NO_DATA=1');
  else
  {
    addUser(req.body.username, req.body.password, req.body.password1,  req.body.email, 
	function (error_code) {
	    if(error_code > 0) {
		// Error codes: 1 - user exists, 2 - email exists, 3 - other DB errors, 4 - Passwords are different
		console.log("Reg error code: " + error_code);
		//res.redirect('/signup.html?err=' + error_code);
	        res.render(path.join(www_dir,www_static_dir , '/signup.html'), { user: req.user, error: error_code, request: req })
	    }
	    else {
		console.log("User has registered");
		res.redirect('/signin.html?username=' + req.body.username + '&REG_OK=1');
	    }
	}
    );


  }
});

router.get('/signin.html', function (req, res){
    //console.log('get /login');
    res.render(path.join(www_dir,www_static_dir , 'signin.html'), { user: req.user, message: req.flash('error'), request: req });
});

router.post('/signin.html',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/signin.html?ERROR_AUTH=1' }));

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

//app.use(express.static(www_dir));
app.use(express.static(path.join(www_dir, www_static_dir)));


// ERROR HANDLING
// custom 404 page
app.use(function (req, res) {
    console.log('404: ' + req.url);
    res.type('text/html');
    res.status(404);
    res.send('<h1>404 - Not Found</h1>');
});

// custom 500 page
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500);
        res.type('text/html');
        res.send('<h1>500 - Server Error</h1>');
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.type('text/html');
    res.send('<h1>500 - Server Error</h1>');
});


// SOCKET.IO HTTP LISTEN
var http;
if (appPort !== ioPort) {
    http = require('http').Server(app).listen(ioPort, function () {
        console.log('Socket.io Http server listening on port: ' + ioPort);
    });
}

// APP LISTEN
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port: ' + app.get('port'));
});
//require('socket.io').of().listen(server); // additional socket.io server to serve /socket.io/ requests

// SOCKET.IO LISTEN
var io = require('socket.io').listen((appPort === ioPort ? server : http), { log: true });

module.exports.io = io;

require("./lib/socketio-slite.js").setDir(www_dir, slitesDir, www_static_dir, slitesReg, function () { });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/signin.html');
}
