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
  , sessionIdCookie = "sliteCurrUser"
  , paypalIpn = require('paypal-ipn');

var app = express();
module.exports.app = app;
module.exports.sessionIdCookie = sessionIdCookie;


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

userSchema.index({email: 1}, {unique: true});

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

var Chat = mongoose.model('chat', chatSchema);

module.exports.chatSchema = Chat;


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

var Billing = mongoose.model('billing', billingSchema);


// User subscription
var subscriptionSchema =  mongoose.Schema({
  uid: { type: String, trim: true, required: true},
  end_date: {type: Date, required: true}
});

subscriptionSchema.index({uid: 1}, {unique: true});

var Subscription = mongoose.model('subscription', subscriptionSchema);

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
  slidesNum: {type: Number}
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

// Users roles
var rolesRestrictions = {};
// Basic account
rolesRestrictions[0] = {maxSlidesCount: 3, maxSlidesSize: 10485760, maxSlideSize: 5242880, rename: 0, domain: 0};
// Silver account
rolesRestrictions[1] = {maxSlidesCount: 3, maxSlidesSize: 10485760, maxSlideSize: 5242880, rename: 1, domain: 1};
// Gold account
rolesRestrictions[2] = {maxSlidesCount: 10000, maxSlidesSize: 104857600, maxSlideSize: 104857600, rename: 1, domain: 1};
// Admin account
rolesRestrictions[10] = {maxSlidesCount: 10000, maxSlidesSize: 104857600, maxSlideSize: 104857600, rename: 1, domain: 1};

var Plans = {
	'1': {desc: 'Silver', price: 5, role: 1},
	'2': {desc: 'Gold', price: 10, role: 2},
	'3': {desc: 'GoldUpgrade', price: 5, role: 2}
};


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

module.exports.UserScheme = User;

function addUser(password, email, callback) {
   console.log("MA: new user2: " + password + " " + email);

  // Seed a user
  var user = new User({ email: email, password: password });

  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  if(re.test(email) == false) {
	  callback(3);
  }
  else {
  //callback(4);

   /*if(password != password_confirm) {
    	console.log("Password confirm error");
    	callback(4)
   }
 else {*/
   user.save(function(err) {
    if(err) {
		console.log("DB ERRORRRR +++++++++ " + err);
	if( err.code === 11000 ) {
	    err_code = 2;
	}
	else {
	    err_code = 3;
	}

	callback(err_code);

    } else {
     console.log('user: ' + user.email + " saved.");
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

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true
  }, function(username, password, done) {
  username = username.toLowerCase();
  User.findOne({ email: username }, function(err, user) {
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
var slitesHashLen = 4;
module.exports.slitesHashLen = slitesHashLen;
var slitesReg = "[0-9a-zA-Z]{" + slitesHashLen + "}";

// Auto redirect to WWW, if no subdomain
var trustedDomains = ["", "slite-dev.elasticbeanstalk.com","slite.elasticbeanstalk.com", "localhost"];
function redirectToWWW(req,res,next) {
	var domainClear = req.hostname.split('.').reverse()[1] + '.' + req.hostname.split('.').reverse()[0];
	if(req.hostname.split('.').length == 2) {
		res.redirect(((req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'] : "https") + '://www.' + domainClear + req.url);
	}
	else if(req.hostname.split('.').length > 3 && trustedDomains.indexOf(req.headers.host) == 0) {
		// Redirect if more than 3 subdomains
		var domainClear = req.hostname.split('.').reverse()[1] + '.' + req.hostname.split('.').reverse()[0];
		res.redirect(((req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'] : "https") + '://www.' + domainClear);
	}
	else {
		next();
	}
}

// Autogenerate session for hosts
var mwCache = Object.create(null);
function virtualHostSession(req, res, next) {
	var host = req.get('host');
	if(host) {
		var domainClear = host.split('.').reverse()[1] + '.' + host.split('.').reverse()[0];
		var hostSession = mwCache[domainClear];
		if (!hostSession) {
			hostSession = mwCache[domainClear] = session({
				secret: 'abrakadabra',
				resave: false,
				cookie: {domain: '.' + domainClear},
				saveUninitialized: false
			});
		}
		hostSession(req, res, next);
	}
	else {
		res.send("Session not found...Reloading page...<meta http-equiv=\"refresh\" content=\"10\" />");
	}
}


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
app.use(virtualHostSession);
/*app.use(session({
    secret: 'abrakadabra',
    resave: false,
    cookie: {domain: '.slite.loc'},
    saveUninitialized: false
}));*/
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// Set session
app.use(function (req, res, next) {

if((req.method == "POST" && req.url == "/paypal") || (req.url == "/google32d58b5279af5365.html")) {
	next();
}
else {
  setUserSession(req,res,function(userId) {
		if(userId == 0) {
			res.redirect(req.url);
		}
		else {
			// Initialize new session
			if(typeof UserData[userId] === 'undefined') {UserData[userId] = {};}
			if(req.user) UserData[userId].domain = req.user.domain
			UserData[userId].currentUserId = userId
			readUserRights(userId, function(res) {
				if(req.user) {
					UserData[userId].userAuth = 1;
					UserData[userId].userRole = res;
					UserData[userId].restrictions = rolesRestrictions[res];
					UserData[userId].domainSet = req.user.domain ? 1 : 0;
				}
				else {
					UserData[userId].userAuth = 0;
					UserData[userId].userRole = 0;
					UserData[userId].restrictions = rolesRestrictions[0];
					UserData[userId].domainSet = 0;
				}
				getUserUploadStatus(userId, function(userAccess) {
					UserData[userId].noUploadForUser = userAccess;
					// Set user session
					UserData[userId].expire = new Date(new Date().getTime() + 86400000);
					module.exports.UserData[userId] = UserData[userId];
					next();
					// Clear old sessions
					for (k in UserData) {
					  var dateComp = new Date();
					  if(dateComp > UserData[k].expire) {
							delete UserData[k];
					  }
					}
				});
			});
		}
    });
}
});

/*app.use(function (req, res, next) {
	// If no session cookie - reset.
	if(typeof req.cookies[sessionIdCookie] === 'undefined') {
		res.redirect(req.url);
	}
	else {
		next();
	}
});*/

// Calculate user slides size sum & slides count
var getUserUploadStatus = function (userId, callback) {
	Slide.find({uid : userId }).exec(function (err, docs) {
		if( docs ) {
			var slidesMB = 0;
			for(i=0;i<docs.length;i++) {
				slidesMB = slidesMB + docs[i].size;
			}
			if(docs.length >= UserData[userId].restrictions.maxSlidesCount) {
				callback(1);
			}
			else if(slidesMB >= UserData[userId].restrictions.maxSlidesSize) {
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

app.use(redirectToWWW);


// Auth array
var UserData = {};
module.exports.UserData = {};

// middleware do render slites files from /slites folders
var slitesRegMW = new RegExp('^\\/' + slitesReg + '(\\/|$)');

// Visualize custom domain slide
app.use(function (req, res, next) {
	var customHash = req.url.substring(1);
	customHash = customHash.replace(/^\?/,"");

    var domainClear = 'www.' + req.hostname.split('.').reverse()[1] + '.' + req.hostname.split('.').reverse()[0];

	if(customHash != '') {
		Slide.find({ scid : { $regex : new RegExp("^" + customHash + "$" , "i") } , paypalPayed: 1, site: domainClear, domainSet: 1 }).exec(function (err, docs) {
		//Slide.find({ scid : customHash , paypalPayed: 1, site: domainClear, domainSet: 1 }).exec(function (err, docs) {
			if(docs.length > 0) {
				docs.forEach(function(data){
					User.findOne({ _id: data.uid }).exec(function (errU, docU) {
						if(docU) {
							if(req.hostname.split('.')[0] == docU.domain) {
								var url = ((req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'] : "https") + "://" + domainClear + "/" + data.sid
								res.set('Content-Type', 'text/html');
								var output = " \
								<html> \
								<head> \
								<title></title> \
								</head> \
								<body style='scrolling:no;'> \
								<iframe src='" + url + "' style='position:absolute; top:0px; left:0px; width:100%; height:100%; z-index:999' frameborder='no' scrolling='auto'> \
								</iframe> \
								</body>";
								res.send(output);
							}
							else {next();}
						}
						else {next();}
					});
				});
			}
			else {
				next();
			}
		});
	}
	else {
		next();
	}
});

// Visualize slides
app.use(function (req, res, next) {
	var customHash = req.url.substring(1);
	customHash = customHash.replace(/^\?/,"");
	var domainClear = 'www.' + req.hostname.split('.').reverse()[1] + '.' + req.hostname.split('.').reverse()[0];
	Slide.findOne( {scid : { $regex : new RegExp("^" + customHash + "$" , "i") } , paypalPayed: 1, site: domainClear, domainSet: 0 }).exec(function (err, doc) {
		if(err) {console.log(err)}
		if( doc ) {
			var url = "/" + doc.sid
			res.set('Content-Type', 'text/html');
			var output = " \
			<html> \
			<head> \
			<title></title> \
			</head> \
			<body style='scrolling:no;'> \
			<iframe src='" + url + "' style='position:absolute; top:0px; left:0px; width:100%; height:100%; z-index:999' frameborder='no' scrolling='auto'> \
			</iframe> \
			</body>";
			res.send(output);
		}
		else {
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
					//var indexPathname = path.join(wwwSlites, hash, 'index.html');                // www/slites/hash/index.html
					var indexPathname = path.join(www_dir, www_static_dir, "A1",'index.html');
					//console.log('RENDERING HTML: ' + indexPathname);
					// Check slide in DB
					slideCheckPresenter(hash, UserData[req.cookies[sessionIdCookie]].currentUserId , function(sfound, spresenter, stitle, spassword, spayed, scustomurl, sisVideoChatOpen, sisScreensharingOpen, sslidesNum, ssetDomain) {
						if(sfound == 1) {
							res.render(indexPathname, {title: stitle, presenter: spresenter, password: spassword ? 1 : 0 , payed:  spayed , customurl: scustomurl, isVideoChatOpen: sisVideoChatOpen, isScreensharingOpen: sisScreensharingOpen, slidesNum: sslidesNum , hash: hash, role: module.exports.userRole });
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
					res.sendFile(fileToSend, fileOptions, function (err) {
						if (err) {
							console.log(err + ' sending arbitrary file: ' + fileToSend);
						}
					});
				}
			}
			else if(req.url == "/A1/") {
				 var indexPathname = path.join(www_dir, www_static_dir, "A1",'index.html');
				 res.render(indexPathname, {title: "A1", presenter: 1, password: 0, payed:  0 , customurl: "", isVideoChatOpen: "", isScreensharingOpen: "", slidesNum: 13 , hash: "HASH_TEMPLATE", role: 0});
			}
			else {
				next();
			}
		}
	});

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


router.post('/paypal', function (req, res, next) {

res.send("Received");

paypalIpn.verify(req.body, {'allow_sandbox': true}, function callback(err, msg) {
    if(msg == "VERIFIED") {
		var accountType = ["NA", "Silver", "Gold", "Gold upgrade"];
		if(accountType.indexOf(req.body["option_selection1"]) > 0) {
			var txnId = req.body["parent_txn_id"] ? req.body["parent_txn_id"] : req.body["txn_id"];

			console.log("Paypal data received: " + txnId + " - Type: " + req.body["payment_status"]);

			if(req.body["payment_status"]) {
				var billing_add = new Billing({txn_id: txnId, account_type: req.body["option_selection1"], uid: req.body["option_selection2"], payment_gross: req.body["payment_gross"], payment_date: req.body["payment_date"], payment_status: req.body["payment_status"]});
				billing_add.save(function(err, saved) {
					if(err) console.error('Can\'t add billing info' + err);
				});

				if(req.body["payment_status"] == "Completed") {
					var dateG = new Date(req.body["payment_date"]);
					dateG.setFullYear(dateG.getFullYear()+1);

					if(req.body.item_number == 3) {
						dateG = "$end_date";
					}

					Subscription.update({ uid: req.body["option_selection2"] }, {$set: { uid : req.body["option_selection2"], end_date: dateG }}, {upsert: true},
						function (err, numAffected) {console.log('Subscription: ' + numAffected + err)}
					);

					User.update({ _id: mongoose.mongo.ObjectID(req.body["option_selection2"]) }, {$set: { role : Plans[req.body.item_number].role }}, {upsert: false},
						function (err, numAffected) {console.log('Role changes: ' + numAffected + err)}
					);

				}
				else if(req.body["payment_status"] == "Refunded") {

				}
			}


		}
		else {
			Slide.update({  sid : req.body["option_selection1"]}, { $set: { paypalTransaction: req.body["txn_id"], paypalPayed: 1 }}).exec();
		}
	}
});

});

function changeAccount(userId) {

}

router.get('/paypal', function (req, res, next) {


Billing.aggregate([
        { $group: {
            _id: '$uid',
            balance: { $sum: '$payment_gross'}
        }}
    ], function (err, results) {
        if (err) {
            console.error(err);
        } else {
            console.log(results);
        }
    });

	if(req.query.tx) {
		Billing.findOne({txn_id : req.query.tx }).exec(function (err, doc) {
			if(doc) {
				res.redirect("/account.html");
			}
			else {
				Slide.findOne({paypalTransaction : req.query.tx }).exec(function (err, doc) {
					if( doc ) {
						var url = '/' + doc.scid;
						if(doc.site) {url = 'http://' + doc.site + url}
						res.redirect(url);
					} else {
				var str = " \
						Processing payment... \
						<meta http-equiv=\"refresh\" content=\"10\" /> \
					";
					res.send(str);
					}
				});
			}
		});
	}
	else {
    res.redirect('/');
	}

});



function setUserSession(req, res, callback) {
	//console.log("------------ Checking user session, IP: " + req.connection.remoteAddress);
	var oldUserId = 0;
	var expDate = new Date(Number(new Date()) + 315360000000);
	var domainClear = req.hostname.split('.').reverse()[1] + '.' + req.hostname.split('.').reverse()[0];

    domainClear = domainClear.replace(/\:(.+)$/g, "");
	domainClear = domainClear.replace(/^undefined\.localhost/g,"localhost");
	//console.log(domainClear);

	   // If no user id - generate or add from req.user._id
	   if(!(req.cookies[sessionIdCookie])) {
			var userIpAddress = req.connection.remoteAddress.replace(/\./g,"");
			var newUserId = (req.user) ? req.user._id.toString() : Math.floor(Math.random() * (99999999999 - 1)) + 1 + userIpAddress + Math.round(+new Date()/1000);
			//console.log("Setting new session cookie");
			res.cookie(sessionIdCookie, newUserId, { domain: '.' + domainClear, expires: expDate });
			callback(0);
			//callback(newUserId);
	   }
	   else {
		// User loged in, but has older, random generated id
		if((req.user) && (req.user._id != req.cookies[sessionIdCookie])) {
			//console.log("-----------Setting new user id");
			oldUserId = req.cookies[sessionIdCookie];
			res.cookie(sessionIdCookie, req.user._id.toString() , {  domain: '.' + domainClear, expires: expDate });

			// Update user Notes
			Note.update({  uid : oldUserId, tmp: 1 }, { $set: { tmp: 0, uid: req.user._id }}, {multi: true, upsert: false},
				function (err, numAffected) {
					if(err) console.log(err);
					if(numAffected > 0) {console.log("Remaped notes: " + numAffected)}
			});
			// Update user slides
			var domainSet = (req.user.domain && rolesRestrictions[req.user.role].domain == 1) ? 1 : 0;
			Slide.update({  uid : oldUserId, tmp: 1 }, { $set: { tmp: 0, uid: req.user._id, domainSet: domainSet }}, {multi: true, upsert: false},
				function (err, numAffected) {
					if(err) console.log(err);
					if(numAffected > 0) {console.log("Remaped slides: " + numAffected)}
			});
			// Send page reload
			callback(0);
		}
		else {
			//console.log("-------------User is set");
			callback(req.cookies[sessionIdCookie]);
		}
	   }
}
// Index page
var rootRegExp = new RegExp('^/($|index(\.html)?$)');
router.get(rootRegExp, function (req, res){

    var domainClear = req.hostname.split('.').reverse()[1] + '.' + req.hostname.split('.').reverse()[0];

	var domainSplit = req.hostname.split('.');

	if(domainSplit.length == 3 && domainSplit[0] != 'www'/* && trustedDomains.indexOf(req.headers.host) == 0*/) {
		User.findOne({ domain : domainSplit[0] }, function (err, docs) {
			if(docs) {
				var owner = (docs._id == UserData[req.cookies[sessionIdCookie]].currentUserId && req.user) ? 1 : 0;
				Slide.find({uid : docs._id }).sort({'created': 'desc'}).exec(function (err, docs) {
					res.render(path.join(www_dir,www_static_dir , 'domain.html'), { owner: owner,	moment: moment, slides: docs, user: req.user , mainDomainGo: ((req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'] : "https") + '://www.' + domainClear, clearDomain: domainSplit[0] + '.' + domainClear, userData: UserData[req.cookies[sessionIdCookie]]});
				});
			}
			else {
				res.redirect(((req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'] : "https") + '://www.' + domainClear);
			}
		});
	}
	else {
		res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		res.header("Pragma", "no-cache");
		res.header("Expires", 0);

		var totalSlides = 0;

		// Paint index page random slides
		function getRandomSlides(Slide, callback) {
			Slide.findRandom({site: req.headers.host, crawled: 1}, {}, {limit: 10},function(err, result) {
			  if (!err) {
				var returnRes = '<!-- Elastislide Carousel --><ul id="carousel" class="elastislide-list">';

				for(i=0;i<result.length;i++) {
					var url = (result[i].scid ? result[i].scid : result[i].sid)
					returnRes += '<li><a href="/'+ url +'"  title="'+ result[i].title +'"><img src="/'+ result[i].sid +'/img0.jpg" alt="'+ result[i].title +'" class="slider-img" /></a></li>\n'
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

		getRandomSlides(Slide,function(randomSlides) {
			res.render(path.join(www_dir, www_static_dir, indexHtml), {
				user: req.user,
				noUploadForUser: UserData[req.cookies[sessionIdCookie]].noUploadForUser,
				randomSlides: randomSlides,
				userRole: UserData[req.cookies[sessionIdCookie]].userRole
			});
		});
	}
});

router.get('/account.html', ensureAuthenticated, function (req, res){
    res.render(path.join(www_dir, www_static_dir ,   'account.html'), { user: req.user, userData: UserData[req.cookies[sessionIdCookie]], protocol: ((req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'] : "https") });
});

router.get('/signup.html', function (req, res){
  if(req.user) {
    res.redirect('/');
  }
  else {
    res.render(path.join(www_dir,www_static_dir , 'signup.html'), { user: req.user, message: req.flash('error'), request: req,  error: 0});
  }
});


router.post('/signup.html', function (req, res){
  console.log("MA: new user: " + req.body.password + " " + req.body.email);
  var errorCode = 0;
  if( !req.body.password || !req.body.email ) {
    res.render(path.join(www_dir,www_static_dir , 'signup.html'), { user: req.user, request: req,  error: 1});
  }
  else
  {
    addUser(req.body.password, req.body.email,
	function (error_code) {
	    if(error_code > 0) {
			// Error codes: 1 - user exists, 2 - email exists, 3 - wrong email,  4 - other DB errors, 5 - Passwords are different
	        res.render(path.join(www_dir,www_static_dir , '/signup.html'), { user: req.user, error: error_code, request: req })
	    }
	    else {
            passport.authenticate('local')(req, res, function () {
					         res.redirect(req.body.redirect ? req.body.redirect + ( (req.body.account) ? '?' + req.body.account : '' ) : '/');
            })
	    }
	}
    );


  }
});

router.get('/signin.html', function (req, res){
    if(req.user) {
      res.redirect('/');
    }
    else {
      res.render(path.join(www_dir,www_static_dir , 'signin.html'), { user: req.user, ERROR_AUTH: 0, request: req });
    }
});


router.get('/letscrawl.html', function (req, res){
	res.send('Crawl is very dangerous! :)');
	if(req.query.password == "startme321!") {
		console.log("Crawling");
		require("./lib/crawler.js").crawl(req.headers.host,20, Slide, www_dir, slitesDir);
	}
	else {
		console.log("Wrong password");
	}
});

router.post('/signin.html',
  function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.render(path.join(www_dir,www_static_dir , 'signin.html'), { user: req.user, ERROR_AUTH: 1, request: req }); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        // Set new session after login is mandotary for middleware
        //setUserSession(req,res,function(userId) {});
        return res.redirect(req.body.redirect ? req.body.redirect : '/');
      });
    })(req, res, next);
});


router.get('/logout', function (req, res){
	req.logout();
	req.session.destroy(function (err) {
		if (err) {
			console.log("MA: logout error: " + err);
			res.redirect('/logout');
		}
		res.clearCookie('connect.sid', { path: '/' });
		delete UserData[req.cookies[sessionIdCookie]];
		var domainClear = req.hostname.split('.').reverse()[1] + '.' + req.hostname.split('.').reverse()[0];
		res.clearCookie(sessionIdCookie , {  domain: '.' + domainClear });
		res.redirect('/');
	});
});

readSlideSize = function(path_to_slide, callback) {
	var size = require('du')(path_to_slide, { filter: function (f) { return /\.(ppt|pptx)$/.test(f) } },  function (err, size) {
		callback(size);
	});
}

module.exports.readSlideSize = readSlideSize;

router.get('/my.html', function (req, res){
	return Slide.find({uid : UserData[req.cookies[sessionIdCookie]].currentUserId }).sort({'created': 'desc'}).exec(function (err, docs) {
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


router.get('/subscription.html', function (req, res){
   	Subscription.findOne({uid : req.cookies[sessionIdCookie] }).exec(function (err, doc) {
		var expire = "";
		if(doc) {expire = doc.end_date}
		res.render(path.join(www_dir,www_static_dir , 'subscription.html'), {
		  request: req,
		  user: req.user,
		  moment: moment,
		  userRole: UserData[req.cookies[sessionIdCookie]].userRole,
		  expire: expire
		});
	});
});

// Render remote control
slideCheckPresenter = function(hashId, currentUserId , callback) {
	if(currentUserId) {
		Slide.findOne({sid : hashId }).exec(function (err, doc) {
			if( doc ) {
				callback(1,(doc.uid == currentUserId) ? 1 : 0,doc.title,doc.password, (doc.paypalPayed == 1 || UserData[currentUserId].restrictions.rename == 1) ? 1 : 0, doc.scid, (doc.isVideoChatOpen) ? 1 : "0", (doc.isScreensharingOpen) ? 1 : "0", (doc.slidesNum > 0) ? doc.slidesNum : 1, (doc.domainSet) ? 1 : 0);
			} else {
				callback(0,0,"","", 0, "");
			}
		});
	}
	else {
		callback(0,0,"","", 0, "");
	}
}

module.exports.slideCheckPresenter = slideCheckPresenter;

router.get('/screensharing.html', function (req, res){
		var hashId = req.query.presentation;
			slideCheckPresenter(hashId, UserData[req.cookies[sessionIdCookie]].currentUserId , function(sfound, spresenter, stitle, spassword) {
				if(sfound == 1 && spresenter == 1) {
					res.render(path.join(www_dir,www_static_dir , 'A1/webrtc/sharing-presenter.html'), {hash: hashId, userId: UserData[req.cookies[sessionIdCookie]].currentUserId});
				}
				else if(sfound == 1 && spresenter == 0) {
					res.render(path.join(www_dir,www_static_dir , 'A1/webrtc/sharing-client.html'), {hash: hashId, userId: UserData[req.cookies[sessionIdCookie]].currentUserId});
				}
				else {
					res.send("No slide")
				}
			});
});

router.get('/video.html', function (req, res){
		var hashId = req.query.presentation;
			slideCheckPresenter(hashId, UserData[req.cookies[sessionIdCookie]].currentUserId , function(sfound, spresenter, stitle, spassword) {
				if(sfound == 1 && spresenter == 1) {
					res.render(path.join(www_dir,www_static_dir , 'A1/webrtc/video-presenter.html'), {hash: hashId, userId: UserData[req.cookies[sessionIdCookie]].currentUserId});
				}
				else if(sfound == 1 && spresenter == 0) {
					res.render(path.join(www_dir,www_static_dir , 'A1/webrtc/video-client.html'), {hash: hashId, userId: UserData[req.cookies[sessionIdCookie]].currentUserId});
				}
				else {
					res.send("No slide")
				}
			});
});

router.get('/remote/index.html', function (req, res){

		var hashId = req.query.presentation;

		var slitesRegMW = new RegExp('^' + slitesReg + '$');
		var match = hashId.match(slitesRegMW);

		if(match) {
			slideCheckPresenter(hashId, UserData[req.cookies[sessionIdCookie]].currentUserId , function(sfound, spresenter, stitle, spassword) {
				if(sfound == 1 && spresenter == 1) {
					 res.render(path.join(www_dir,www_static_dir , 'remote/index.html'), {title: stitle, password: spassword});
				}
				else {
					res.redirect('/');
				}
			});
		}
		else if(hashId == "A1") {
			 res.render(path.join(www_dir,www_static_dir , 'remote/index.html'), {title: "A1", password: ""});
		}
		else {
			res.redirect('/');
		}
});

router.get('/clearcash', function (req, res){
	console.log(req.header('x-forwarded-for'))
	if(req.query.password == "LetsClearItup") {
		res.send("Cleaning cash...");
		deleteOldHashFolders();
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
var io = require('socket.io').listen((appPort === ioPort ? server : http), { log: true});

module.exports.io = io;

var socketIoSlite = require("./lib/socketio-slite.js").setDir(www_dir, slitesDir, www_static_dir, slitesReg, function () { });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/signin.html');
}

module.exports.deleteFolderRecursive = function(path) {
	if( fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file,index){
		  var curPath = path + "/" + file;
		  if(fs.lstatSync(curPath).isDirectory()) {
			module.exports.deleteFolderRecursive(curPath);
		  } else {
			fs.unlink(curPath, function (err) {
			   if (err) console.log("Can't delete file " + err);
			  console.log(curPath + 'successfully deleted');
			});
		  }
		});

		fs.rmdir(path, function (err) {
		  if (err) console.log("Can't delete folder " + err);
			console.log(path + 'successfully deleted');
		});
	}
}

function deleteOldHashFolders() {
	var hashPath = path.join(www_dir, slitesDir);
	// Clear old folders
	fs.readdirSync(hashPath).forEach(function (folder, index) {
		Slide.findOne({sid: folder }, function (err, slidesDoc) {
				if(!slidesDoc) module.exports.deleteFolderRecursive(path.join(hashPath, folder));
		});
	});
	// Clear notes
	Slide.find({}, function (err, slidesDoc) {
		var documents = new Array;
		slidesDoc.forEach(function(doc) {
			documents.push(doc.sid);
		});
		Note.find({sid: {$nin : documents}}, function (nerr, notesDoc) {
			var docsToDelete = new Array;
			notesDoc.forEach(function(nDoc) {
				if(nDoc.sid!='A1') {
					nDoc.remove();
				}
			});
		});
	});
}


function readUserRights(userId, callback) {
	User.findOne({_id: userId }, function (err, userDoc) {
		if(userDoc) {callback(userDoc.role > 0 ? userDoc.role : 0)}
		else {callback(0)}
	});
}

module.exports.getCookie = function (cookie, cookiename) {
  var cookiestring=RegExp(""+cookiename+"[^;]+").exec(cookie);
  return unescape(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
}
