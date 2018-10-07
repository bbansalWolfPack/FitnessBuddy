require('../database_models/consultant.js');
var mongoose = require('mongoose');


const idMap = {0: "Consultant1", 1: "Consultant2", 2: "Consultant3", 3: "Consultant4"};

var Consultant = mongoose.model('Consultant');

exports.getAllConsultants = function(bot, message, response) {
    console.log("Debug: get all consultants begins"); // Debug

    Consultant.find({}, function(err, result) {
      if (err) {
        console.log("Failed to fetch consultants info");
        bot.reply(message, "Internal server error, please try again after some time");
      } else {
        if (result) {
          textFormatter(bot, message, result);
        }
      }
    });
}

function textFormatter(bot, message, data) {
    bot.startConversation(message, function(err, convo) {
        convo.say("Here are all our available consultants for the next week:");
        var reply = "";
        for(var i=0; i<data.length; i++) {
            reply += "> " + (i+1) + ". Name: *" + data[i].name + "*, ID: *" + idMap[i] + "*,  Type: *" + data[i].type + "*,   Gender: *" + data[i].Gender + "*,  Expertise: *" + data[i].expertise + "*,  Package Price: *" + `$${data[i].packagePrice}` + "*, Slots Available: *" + data[i].numberOfSlotsAvailable + "*,  Days Available: *" + data[i].daysAvailable + "*\n";
        }
        reply += "\n\n\n\n";
        convo.say(reply);
    });
}
