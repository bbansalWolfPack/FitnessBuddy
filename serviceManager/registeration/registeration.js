require('../database_models/user.js');
var mongoose = require('mongoose');
var nock = require("nock");

var User = mongoose.model('User');

exports.signUpUser = function(params, bot, message, response) {

    var userId = params.UserId;
    console.log("post_keys : POST Request ")
    console.log(userId);
    User.findOneAndUpdate({
        "UserId": params.UserId,
        "Name": params.Name
    }, params, {
        upsert: true,
        new: true
    }, function(err, User) {
        if (err) {
            bot.reply(message, "Server Error, please try again after some time")
        } else {
            bot.reply(message, "Registeration Succesfull");
        }
    });
};
