const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');


const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//import express-session
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const passport = require('passport');
const authenticate = require('./authenticate');
const config = require('./config');

const index = require('./routes/index');
const users = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Dishes = require('./models/dishes');
const url = config.mongoUrl;
const connect = mongoose.connect(url);

//connect mongoose to DB
connect.then(() => {
    let db = mongoose.connection;
    console.log(`Connected correctly to the server`);
}, (err) => {
    console.log(err);
});

const app = express();

//redirect to the secure port
app.all('*', (req, res, next) => {
   if(req.secure){
    return next();
   }else {
       //307 - return status code: user-agent must not change request method
       res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
   }
});

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser('12345-67890-09876-54321'));


app.use(passport.initialize());



app.use('/', index);
app.use('/users', users);



app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
