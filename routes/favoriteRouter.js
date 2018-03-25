const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        //mongoose method find
        Favorites.findOne({user: req.user._id})
            .populate('user dishes')
            .then((favorites) => {
                  console.log(`Here is the favorites ==> ${favorites}`);
                if (favorites !== null) {
                    let user_id_string = favorites.user._id;
                    if (req.user.id.localeCompare(user_id_string) === 0) {
                        console.log(`examination is passed!`);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    }
                    else {
                        let err = new Error(`Your are not authorized to perform this operation!`);
                        err.status = 403;
                        return next(err);
                    }
                }
                else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    //res.json(favorites);
                    res.json(`There are no favorites for this user`);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if (favorites === null) {
                    // req.body.user = req.user._id;
                    //console.log(req.body)vnovodid;
                    Favorites.create({})
                        .then((favorites) => {
                            favorites.user = req.user._id;
                            favorites.dishes = req.body;
                            favorites.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    // console.log(`checking arrays!`);
                    //console.log(`Here is the favorites ==> ${favorites}`);
                    let arr = req.body.map((item) => item._id);
                    let dishes = favorites.dishes;
                    arr.forEach((item) => {
                        if (dishes.indexOf(item) === -1) {
                            dishes.push(item);
                        }
                    });
                    favorites.save()
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err))
                }
            });
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if(favorites !== null) {
                    Favorites.remove({user: req.user._id})
                        .then((resp) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }
            }, (err) => next(err));
    });

favoriteRouter.route('/:favoriteId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res , next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if(!favorites){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "favorites": favorites})
                }
                else {
                    if(favorites.dishes.indexOf(req.params.favoriteId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({"exists": false, "favorites": favorites})
                    }else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({"exists": true, "favorites": favorites})
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if(favorites !== null) {
                    let new_dish = req.params.favoriteId;
                    console.log(`new_dish ==> `,new_dish);
                    let dishes = favorites.dishes;
                    console.log(`dishes ==> `,dishes);
                    if(dishes.indexOf(new_dish) === -1){
                        dishes.push(new_dish);
                        favorites.save()
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            }, (err) => next(err))
                    }else {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        //res.json(favorites);
                        res.json(`This dish is already present in favorites`);
                    }
                }
                else if (favorites === null) {
                    // req.body.user = req.user._id;
                    //console.log(req.body)vnovodid;
                    Favorites.create({})
                        .then((favorites) => {
                            favorites.user = req.user._id;
                            favorites.dishes = [];
                            favorites.dishes.push(req.params.favoriteId);
                            favorites.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            })

    })
    .delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) =>{
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if(favorites !== null) {
                    let dish_to_delete = req.params.favoriteId;
                    console.log(`dish_to_delete ==> `,dish_to_delete);
                    let dishes = favorites.dishes;
                    if (dishes.indexOf(dish_to_delete) === -1) {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        //res.json(favorites);
                        return res.json(`There is no dish with such id!!!`);
                    }
                    dishes.forEach((item) => {
                       console.log(`item ==> `, item);
                    });
                    //should work  but is not working with proposed client version
                    // favorites.dishes = dishes.filter((item) => {
                    //     if(item.toString().localeCompare(dish_to_delete) === -1)  return item;
                    // });
                    if(dishes.indexOf(dish_to_delete) > -1 ){
                        let index = dishes.indexOf(dish_to_delete);
                        favorites.dishes.splice(index, 1);
                    }
                    console.log(`favorite.dishes ==> `, favorites.dishes);
                    console.log(`favorites.dishes.length ==> `, favorites.dishes.length);
                    if(favorites.dishes.length === 0){
                        return Favorites.remove({user: req.user._id})
                            .then((resp) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(resp);
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    }
                    favorites.save()
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    //res.json(favorites);
                    res.json(`There are no dishes to delete!!!`);
                }
            }, (err) => next(err));
    });

module.exports = favoriteRouter;