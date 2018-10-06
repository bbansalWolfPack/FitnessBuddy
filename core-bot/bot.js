var Botkit = require('botkit');
var apiai = require('apiai');
var app = apiai(process.env.APIAITOKEN);
var Slack = require('slack-node')
var request = require('request')
var slack = new Slack(process.env.SLACKTOKEN)
var shortid = require('shortid')
// variable to store all slack user details
var slackUsersList =[]
var url = "https://api.api.ai/v1/"
var userIdNameMap = {}

var userIdEmailMap = {}
function getSlackUsers() {

  slack.api("users.list", function(error, response) {
    slackUsersList = response.members;

  });
  for(var i = 0 ; i < slackUsersList.length; i++) {
    var user = slackUsersList[i];
    userIdNameMap[user.id] = user.real_name
    userIdEmailMap[user.id] = user.profile.email
  }
}


var possibleFunctions = "Here is what I can do for you: \n 1. `Sign up` : Sign up as a new user\n 2. `Track Calories` : Enter your food intake and we will take care of the calories intake for you\n 3. `Track Exercise` : Enter your daily exercise activity and we will track your calories burned\n 4. `Show Progress`: Choose to see your daily achievements and reports. \n 5. `Hire a consultant` : Choose to see the list of instructors available and enroll in their fitness program\n 6. `exit` : exit the conversation\n"

var controller = Botkit.slackbot({
    debug: false
});

// connect the bot to a stream of messages
controller.spawn({
    token: process.env.SLACKTOKEN,
}).startRTM()

/** Stores the latest session id associated with the user **/
var sessionMap = {}
getSlackUsers()

controller.hears('(.*)', ['mention', 'direct_mention', 'direct_message'], function (bot, message) {
      if (sessionMap[message.user] == undefined) {
      sessionMap[message.user] = message.user;
    }

      if(message.text.indexOf("<") > 1) {
        console.log("Initial:" + message.text)
        message.text = message.text.substring(0,message.text.indexOf("<"));
      }

      var request = app.textRequest(message.text, {
      sessionId: sessionMap[message.user]
    });

    request.on('response', function (response) {
        // console.log(response);
        if (response.result.actionIncomplete) {
            bot.reply(message, response.result.fulfillment.speech);
        } else {
            switch (response.result.action) {

                case 'user.initiation':
                   if(userIdNameMap[message.user] == undefined) {
                     getSlackUsers()
                   }

                   bot.reply(message, "Hello, " + userIdNameMap[message.user])
                   break;

                case 'greeting.initial':
                    bot.reply(message, response.result.fulfillment.speech);
                    break;

                case 'user.reply':
                    bot.reply(message, response.result.fulfillment.speech);
                    break;

                case 'bot.help':
                    bot.reply(message, possibleFunctions);
                    break;

                case 'action.exit':
                    bot.reply(message, response.result.fulfillment.speech);
                    sessionMap[message.user] = message.user;
                    deleteContextsForUser(message.user)
                    break;

                case 'conversation.end':
                    if(userIdNameMap[message.user] == undefined) {
                        getSlackUsers()
                    }
                     bot.reply(message, "Good Bye, " + userIdNameMap[message.user])
                    break;

                default:
                    bot.reply(message, response.result.fulfillment.speech);

            }
        }
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();
});


function deleteContextsForUser(sessionId)
{

	var options = {
		url: url + "contexts/?sessionId=" + sessionId,
		method: 'DELETE',
		headers: {
			"User-Agent": "EnableIssues",
			"content-type": "application/json",
			"Authorization": "Bearer" + process.env.APIAITOKEN
		}
	};

	// Send a http request to url and specify a callback that will be called upon its return.
	request(options, function (error, response, body)
	{
    console.log("context cleared");
	});

}


function validateOTP(number, otp, callback) {
  if(otp == number) {
    callback(true);
  } else{
    callback(false);
  }
}
