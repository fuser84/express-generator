const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy; //strategy for configuring passport module
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');

//authenticate function is provided by passport-local-mongoose
exports.local = passport.use(new LocalStrategy(User.authenticate()));
//support for sessions: also provided by passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

//options for jwt strategy
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //how JSONtoken should be extracted from incoming message
opts.secretOrKey = config.secretKey;

//export passport strategy
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => { //verify function that parses the req.message
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
           if(err){
               return done(err, false);
           }
           else if(user){
               return done(null, user);
           }
           else {
               return done(null, false);
           }
        });
    }));

//authentication token will be used from here ==> opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//and it will be passed to the authenticate() method
//takes token to verify the user
exports.verifyUser = passport.authenticate('jwt', {session: false});//without sessions

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        console.log(`verifyAdmin is true`);
        next();
    }else {
        let err = new Error(`Your are not authorized to preform this operation!`);
        err.status = 403;
        return next(err);
    }

};

