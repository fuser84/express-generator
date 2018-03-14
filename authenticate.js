const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

//authenticate function is provided by passport-local-mongoose
exports.local = passport.use(new LocalStrategy(User.authenticate()));
//support for sessions: also provided by passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

