module.exports = function(settings) {

  // Facebook return & auth
  settings.router.get('/facebook/return',
    settings.passport.authenticate('facebook', { failureRedirect: '/?facebook-err=1#login' }),
    function(req, res) {
      res.redirect('/#top');
    }
  );
  // Facebook auth redirect
  settings.router.get('/login/facebook',settings.passport.authenticate('facebook',  { scope : ['email'] }));


};
