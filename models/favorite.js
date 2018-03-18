const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//load new currency type into mongoose
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }]

}, {
    timestamps: true
});

let Favorites = mongoose.model('Favorite', favoriteSchema);