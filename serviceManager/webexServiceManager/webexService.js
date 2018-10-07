var emailService = require('../../emailService/emailService.js');
require('../database_models/user.js');
var mongoose = require('mongoose');
var nock = require("nock")
var needle = require('needle');

var User = mongoose.model('User');

var Consultant = mongoose.model('Consultant');

const consultantMap = {
    "Consultant1": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS8wZjk5YTMzMi1mNmFlLTQxMDUtYTI5OS1hZTA4ZGExYTFlNGQ",
    "Consultant4": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS81ODJkZmM3NC1lZWZmLTRiY2ItYjVmOS1mM2Q0OWRkOTZhNzU"
};

exports.setupMeeting = function(bot, message, consultantName, id, daySelected, userName) {
    let consultantId = consultantMap[id];
    bot.startConversation(message, function(err, convo) {
        if (err) {
            bot.reply("Internal Server Error, try again after some time");
        } else {
            convo.say("Please wait a moment, Setting up your meeting.");
            let roomTitle = `Fitness Discussion between ${consultantName} and ${userName}`;
            client.createRoom(roomTitle, function(err, resp, body) {
                if (err) {
                    console.log(err);
                    console.log("Failed to create room for the meeting");
                    bot.reply(message, "Internal Server Error, Please try again later");
                }

                if (!err && resp.statusCode === 200) {
                    var roomId = resp.body.id;
                    let userId;
                    let userEmail;
                    User.findOne({
                        "UserId": message.user
                    }, function(err, result) {
                        if (err) {
                            console.log("Could not retrieve user from database");
                            bot.reply(message, "Failed to create meeting, please retry");
                        } else {
                            userId = result.webexId;
                            userEmail = result.email;
                            client.addUSerToRoom(roomId, userId, false, function(err, resp, body) {
                                if (err) {
                                    console.log("Failed to add user to chat room");
                                    bot.reply(message, "Failed to create chat room. Please try again");
                                }

                                if (!err && resp.statusCode === 200) {

                                    // add fitness instructor to meeting with moderator permissions
                                    console.log("adding instructor");
                                    client.addUSerToRoom(roomId, consultantId, false, function(err, resp, body) {
                                        if (err) {
                                            console.log("Failed to add instructor to the room");
                                            bot.reply(message, "Faield to create chat room, please try again");
                                        }
                                        console.log("instructor added");
                                        if (!err && resp.statusCode === 200) {
                                            Consultant.findOne({
                                                "webexId": consultantId
                                            }, function(err, result) {
                                                if (err) {
                                                    console.log("Failed to retrive instructor email id from database");
                                                } else {
                                                    let instructorEmail = result.email;
                                                    emailService.sendEmail(userEmail, false, userName, consultantName, instructorEmail, daySelected);
                                                    emailService.sendEmail(instructorEmail, true, userName, consultantName, daySelected);
                                                }
                                            })
                                            bot.reply(message, "WebEx meeting created with fitness instructor. You both will get an email with all the details. Thank you")
                                        }
                                    })
                                }
                            })
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
    'Authorization': 'Bearer NDJlNjVhNzQtMTgyMS00YTc2LWIzMzQtOGJhNzA0MjE2YTFlMzczYzQzODItODQ5'
};

var client = {

    createRoom: function(roomTitle, onResponse) {
        var data = {
            "title": roomTitle,
        };

        console.log("Creating webex room");
        needle.post("https://api.ciscospark.com/v1/rooms", data, {
            headers: headers,
            json: true
        }, onResponse);
    },

    addUSerToRoom: function(roomId, userId, isModeratorFlag, onResponse) {
        var data = {
            "roomId": roomId,
            "personId": userId,
            "isModerator": isModeratorFlag
        };

        console.log(data);

        console.log("adding user to the meeting room");
        needle.post("https://api.ciscospark.com/v1/memberships", data, {
            headers: headers,
            json: true
        }, onResponse);
    }
}
