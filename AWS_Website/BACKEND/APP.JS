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
  , mongooserand = require('mongoose-simple-random')
  , bcrypt = require('bcrypt')
  , path = require('path')
  , converter = require('./lib/converter.js')
  , moment = require('moment')
  , SALT_WORK_FACTOR = 10
  , appPort = 8081
  , ioPort = 1337
  , maxSlidesCount = 5
  , maxSlidesSize = 10485760
  , maxSlideUploadSize = 5242880
  , sessionIdCookie = "sliteCurrUser";

var app = express();
module.exports.app = app;
module.exports.maxSlideUploadSize = maxSlideUploadSize;


mongoose.connect('localhost', 'test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

// User Schema
var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
});


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

var Note = mongoose.model('note', notesSchema);

module.exports.NoteScheme = Note;

// SlidesDB
var slidesSchema = mongoose.Schema({
  uid: { type: String},
  sid: { type: String},
  title: { type: String}, 
  size: { type: Number}, 
  tmp: {type: String},
  created: { type: Date },
  crawled: { type: String,  default: 0 },
  url: {type: String},
  desc: { type: String },
  site: { type: String },
  keywords: { type: String }
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

module.exports.SlideScheme = Slide;

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
  username = username.toLowerCase();
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
module.exports.www_static_dir = www_static_dir;
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


// Calculate user slides size sum & slides count
var getUserUploadStatus = function (userId, callback) {
	Slide.find({uid : userId }).exec(function (err, docs) {
		if( docs ) {
			var slidesMB = 0;
			for(i=0;i<docs.length;i++) {
				slidesMB = slidesMB + docs[i].size;		
			}
			if(docs.length >= maxSlidesCount) {
				callback(1);
			}
			else if(slidesMB >= maxSlidesSize) {
				callback(1);
			}
			else {
				callback(0);
			}
		}
		else {
			callback(0);
		}
	});
}

// middleware do render slites files from /slites folders
var slitesRegMW = new RegExp('^\\/' + slitesReg + '(\\/|$)');
app.use(function (req, res, next) {
    if(req.user) {
		module.exports.userAuth = 1;
    }
    else {
		module.exports.userAuth = 0;
    }

    setUserSession(req,res,function(userId) {
		module.exports.currentUserId =  userId;
		getUserUploadStatus(userId, function(userAccess) {
				module.exports.noUploadForUser = userAccess;
		});	
    });
	
	
	
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
            afterHash = req.url.substring(slashPos + 1).trim();
        }
        //console.log('hash: ' + hash);
        //console.log('afterHash: ' + afterHash);
        
        if (afterHash === '' ||
            afterHash.match(/^index($|\.html$|\.htm$)/)) {              // if nothing after hash or index.html (from slites/hash folder)
            var indexPathname = path.join(wwwSlites,
                                          hash,
                                          'index.html');                // www/slites/hash/index.html
            //console.log('RENDERING HTML: ' + indexPathname);
			// Check slide in DB

			slideCheckPresenter(hash, function(sfound, spresenter, stitle) {
				if(sfound == 1) {
					res.render(indexPathname, {title: stitle, presenter: spresenter });					
				}
				else {
					console.log( "Slide was not found" );
					res.redirect('/');
				}
			});
        } else if (afterHash.match(/^img[0-9]{1,6}\.jpg(\?ts=[0-9]+)?$/i)) {  // img*.jpg files (from slites/hash folder)
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
                    console.log(err + ' sending img file: ' + jpgPathname);
                }
            });
        } else if (hash && afterHash.match(/download\s*(\/?|\\)?$/i)) {
            var hashPath = path.join(wwwSlites, hash);
            console.log('Downloading presentation from: ', hashPath);
            socketIoSlite.getHashPresentation(hash, function (err, fileName) {
                if (err) {
                    console.error(err);
                } else {
                    var fileOptions = { lastModified: true, maxAge: 0 };
                    var fileToSend = path.join(hashPath, fileName);
                    console.log("Sending presentation: " + fileToSend);
                    res.sendFile(fileToSend, fileOptions, function (err) {
                        if (err) {
                            console.log('Error while sending presentation file:' + fileToSend, err);
                        }
                    });
                }
            });
        } else {                                                    // all other files from www_static folder
            console.log('Arbitrary hash file: ' + afterHash);
            var fileOptions = { lastModified: true, maxAge: 0 };
            var hashPath = path.join(wwwSlites, hash);
            var fileToSend = path.join(hashPath, afterHash);
            //console.log('filePathname: ' + filePathname);
            res.sendFile(fileToSend, fileOptions, function (err) {
                if (err) {
                    console.log(err + ' sending arbitrary file: ' + fileToSend);
                }
            });
        }
        //console.log('\n');
	} 
	else if(req.url == "/A1/") {
		 var indexPathname = path.join(www_dir, www_static_dir, "A1",'index.html'); 
		 res.render(indexPathname, {title: "A1", presenter: 1});
		console.log(indexPathname);
	}
    else {
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

function setUserSession(req, res, callback) {
	//console.log("------------ Checking user session, IP: " + req.connection.remoteAddress);
	var oldUserId = 0;
	var expDate = new Date(Number(new Date()) + 315360000000);
	   // If no user id - generate or add from req.user._id
	   if(!(req.cookies[sessionIdCookie])) {
		var userIpAddress = req.connection.remoteAddress.replace(/\./g,"");
		var newUserId = (req.user) ? req.user._id : Math.floor(Math.random() * (99999999999 - 1)) + 1 + userIpAddress + Math.round(+new Date()/1000);
		//console.log("New user ID: " + newUserId);
		//console.log("Setting new session cookie");
		res.cookie(sessionIdCookie, newUserId, { expires: expDate });
		callback(newUserId);
	   }
	   else {
		//console.log("User id is " + req.cookies[sessionIdCookie]);
		// User loged in, but has older, random generated id
		if((req.user) /*&& (req.user._id != req.cookies[sessionIdCookie])*/) {
			//console.log("Setting new user id");
			oldUserId = req.cookies[sessionIdCookie];
			if(req.user._id != req.cookies[sessionIdCookie]) {
				res.cookie(sessionIdCookie, req.user._id, { expires: expDate });
			}
			// Update user Notes
			Note.update({  uid : oldUserId, tmp: 1 }, { $set: { tmp: 0, uid: req.user._id }}).exec();
			// Update user slides
			Slide.update({  uid : oldUserId, tmp: 1 }, { $set: { tmp: 0, uid: req.user._id }}).exec();
			callback(req.user._id);
		}
		else {
			//console.log("User is set");
			callback(req.cookies[sessionIdCookie]);
		}
		// Else - User  doesn't need any changes
	   }
	//console.log("------------------------ ");
}

var rootRegExp = new RegExp('^/($|index(\.html)?$)');
router.get(rootRegExp, function (req, res){
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);

  var totalSlides = 0;

  // Paint index page random slides
  function getRandomSlides(Slide, callback) {
	Slide.findRandom({site: req.headers.host}, {}, {limit: 10},function(err, result) {
	  if (!err) {
		var returnRes = '<!-- Elastislide Carousel --><ul id="carousel" class="elastislide-list">';
		
		for(i=0;i<result.length;i++) {
			returnRes += '<li><a href="/'+ result[i].sid +'"  title="'+ result[i].title +'"><img src="/'+ result[i].sid +'/img0.jpg" alt="'+ result[i].title +'" class="slider-img" /></a></li>\n'
			//returnRes += '<a href="/'+ result[i].sid +'"><img src="/'+ result[i].sid +'/img0.jpg" height="150"></a>&nbsp;&nbsp;';
		}
		returnRes += '</ul> \
		<!-- SLIDE CAROUSEL --> \
		<script type="text/javascript"> \
			$( \'#carousel\' ).elastislide(); \
		</script>'
		callback(returnRes)
	  }
	});
  }
  

  
  
  getUserUploadStatus(module.exports.currentUserId, function(userAccess) {
	 getRandomSlides(Slide,function(randomSlides) {
		res.render(path.join(www_dir, www_static_dir, indexHtml), { 
			user: req.user,
			noUploadForUser: userAccess,
			randomSlides:  randomSlides
		});
	 });
 
  });
});

router.get('/account.html', ensureAuthenticated, function (req, res){
    res.render(path.join(www_dir, www_static_dir ,   'account.html'), { user: req.user });
});

router.get('/signup.html', function (req, res){
    //console.log('get /login');	
    res.render(path.join(www_dir,www_static_dir , 'signup.html'), { user: req.user, message: req.flash('error'), request: req,  error: 0});
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


router.get('/letscrawl.html', function (req, res){
	res.send('Crawl is very dangerous! :)');
	if(req.query.password == "startme321!") {
		console.log("Crawling");
		require("./lib/crawler.js").crawl(req.headers.host,1, Slide, www_dir, slitesDir);
	}
	else {
		console.log("Wrong password");
	}
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
	res.clearCookie(sessionIdCookie);
    res.redirect('/');
  });
});

readSlideSize = function(path_to_slide, callback) {
	var size = require('du')(path_to_slide, { filter: function (f) { return !/\.(ppt|pptx)$/.test(f) } },  function (err, size) {
		callback(size);
	});
}

module.exports.readSlideSize = readSlideSize;

router.get('/my.html', function (req, res){
	return Slide.find({uid : module.exports.currentUserId }).sort({'created': 'desc'}).exec(function (err, docs) {
        if( !err ) {
            res.render(path.join(www_dir,www_static_dir , 'my.html'), {
              slides: docs,
			  request: req,
			  user: req.user,
			  moment: moment
            });
        } else {
            return console.log( err );
        }
    });
});
// Render remote control

slideCheckPresenter = function(hashId, callback) {
		Slide.findOne({sid : hashId }).exec(function (err, doc) {
			if( doc ) {
				console.log("Slide was found");
				var slidePresenter = (doc.uid == module.exports.currentUserId) ? 1 : 0;
				callback(1,slidePresenter,doc.title);
			} else {
				console.log("Slide was not found");
				callback(0,0,"");
			}
		});	
}

module.exports.slideCheckPresenter = slideCheckPresenter;

router.get('/remote/index.html', function (req, res){
	
		var hashId = req.query.presentation;

		console.log(hashId);
		
		var slitesReg = "[0-9a-zA-Z]{4}";
		var slitesRegMW = new RegExp('^' + slitesReg + '$');
		var match = hashId.match(slitesRegMW);
		
		if(match) {
			slideCheckPresenter(hashId, function(sfound, spresenter, stitle) {
				if(sfound == 1 && spresenter == 1) {
					 res.render(path.join(www_dir,www_static_dir , 'remote/index.html'), {title: stitle});
				}
				else {
					res.redirect('/');
				}			
			});
		}
		else if(hashId == "A1") {
			 res.render(path.join(www_dir,www_static_dir , 'remote/index.html'), {title: "A1"});
		}
		else {
			res.redirect('/');			
		}
});

app.use('/', router);

//app.use(express.static(www_dir));
app.use(express.static(path.join(www_dir, www_static_dir)));


// ERROR HANDLING
// custom 404 page
app.use(function (req, res) {
    console.log('404: ' + req.url + ', User-Agent: ' + req.headers['user-agent']);
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

var socketIoSlite = require("./lib/socketio-slite.js").setDir(www_dir, slitesDir, www_static_dir, slitesReg, function () { });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/signin.html');
}
