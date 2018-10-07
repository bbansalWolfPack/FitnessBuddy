require('../database_models/user.js');
var mongoose = require('mongoose');
var nock = require("nock")
var needle = require('needle');

var User = mongoose.model('User');

exports.signUpUser = function(params, bot, message, response) {

    var userId = params.UserId;
    console.log("post_keys : POST Request ")
    console.log(userId);
    bot.startConversation(message, function(err, convo) {
        if (err) {
            bot.reply("Internal Server Error, try again after some time");
        } else {
            convo.say("Please wait a moment, signing you up!");
            client.createWebExPerson(params.email, params.Name, function(err, resp, body) {
                if (err) {
                    console.log(err);
                    console.log("Failed to sign up new user");
                    bot.reply(message, "Server Error, or you are already an existing user");
                }

				console.log(resp.body)
                if (!err && resp.statusCode === 200) {
                    var webexId = resp.body.id;
                    params.webexId = webexId;

                    User.create(params, function(err, User) {
                        if (err) {
                            console.log("Failed to write on database");
                            bot.reply(message, "Internal server error");
                        } else {
                            let reply = `Registeration Succesfull. According to my calculations, your daily calories intake shall be: ${params.caloriesGoal} Kcal`;
                            bot.reply(message, reply);
                        }
                    })
                }
            })
        }
        convo.next();
    });
};


var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': 'Bearer ODlhMmYxNmYtNWVkYy00NWRkLWE3ODktMjFlYzc1MTc1MzRhMWVhZTc4NGEtNTMy'
};

var client = {
    createWebExPerson: function(email, displayName, onResponse) {
        var data = {
            "emails": [email],
            "displayName": displayName
        };

        console.log("Creating webex person");
        needle.post("https://api.ciscospark.com/v1/people", data, {
            headers: headers,
            json: true
        }, onResponse);
    }
}
