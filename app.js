const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');


const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Dishes = require('./models/dishes');
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

//connect mongoose to DB
connect.then(() => {
    let db = mongoose.connection;
    console.log(`Connected correctly to the server`);
}, (err) => {
    console.log(err);
});

const app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321'));

//basic authentication
let auth = (req, res, next) => {
    console.log(req.signedCookies);

    //if user is not authorized
    if(!req.signedCookies.user){
        let authHeader = req.headers.authorization;
        if(!authHeader){
            let err = new Error(`You are not authenticated!`);
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }

        //extract username and password and encode it
        let auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
        let username = auth[0];
        let password = auth[1];

        if(username === 'admin' && password === 'password'){
            //user=> name, admin ==> value as a result client will have cookie on it's side
            res.cookie('user', 'admin', {signed: true});
            next();
        }else{
            let err = new Error(`You are not authenticated!`);
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
    }else {
        if(req.signedCookies.user === 'admin'){
            next();
        }else{
            let err = new Error(`You are not authenticated!`);
            err.status = 401;
            return next(err);
        }
    }

};

app.use(auth);


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
