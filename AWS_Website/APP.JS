var flash = require('connect-flash')
  , express = require('express3')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy;
  

var users = [
    { id: 1, username: 'ehehey', password: 'secret', email: 'ehehey@gmail.com' }
  , { id: 2, username: 'djwizard', password: 'secret', email: 'wizard_files@yahoo.com' }
];

function addUser(username, password, email) {
	console.log("MA: new user2: " + username + " " + password + " " + email);
	users.push( {id: users.length, username: username, password: password, email: email} );
	console.log("MA: new user3: " + users);
}

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname);
  app.set('view engine', 'ejs');
  app.engine('.html', require('ejs').renderFile);
  app.set("view options", {layout: false});
  app.use(express.logger());
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
  app.use(express.static(__dirname));
});


app.get('/', ensureAuthenticated, function(req, res){
  res.render('index.html');
});

app.post('/account', function(req, res){
  console.log("MA: new user: " + req.body.username + " " + req.body.password + " " + req.body.email);
  if( !req.body.username || !req.body.password || !req.body.email ) res.redirect('/signup.html');
  else
  {
	addUser(req.body.username, req.body.password, req.body.email);
	res.redirect('/logout');
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
  res.redirect('/');
});

app.listen(8081);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
