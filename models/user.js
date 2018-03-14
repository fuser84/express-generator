const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');//username and password
// will be added automatically so they are deleted from User schema

const User = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose); //support for username and password


module.exports = mongoose.model('User', User);