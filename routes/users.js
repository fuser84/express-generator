const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
    //register is the method that is provided by passport-local-mongoose
   User.register(new User({username: req.body.username}),
       req.body.password, (err, user)  => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }else {
                //authenticate the user that is just registered
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                });
            }
       });
});

//if authenticate will fail, authenticate automatically will
// send reply about failure to the client
//if all is ok callback will be triggered

router.post('/login', passport.authenticate('local'), (req, res) => {

    let token = authenticate.getToken({_id: req.user._id});//req.user is get after authenticate() above
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'Your are successfully logged in!'});
});

//in order not to apply any info we use get
router.get('/logout', (req, res) => {
   if(req.session) {
       req.session.destroy();//remove session
       res.clearCookie('session-id');
       res.redirect('/');
   }else {
       let err = new Error(`You are not logged in!`);
       err.status = 403;
       next(err);
   }
});

module.exports = router;
