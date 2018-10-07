var request = require('request');
var serviceURL = "http://service:3001";

var registerationService = require('../serviceManager/registeration/registeration.js');
var caloriesTrackingService = require('../serviceManager/calorieTracking/calorieTracking');
var trackExerciseService = require('../serviceManager/exerciseTracking/exerciseTracking.js');


var consultantService = require('../serviceManager/consultantServiceManager/consultantService.js');


var webexService = require('../serviceManager/webexServiceManager/webexService.js');

module.exports = {

    registerUser: function(bot, message, response, userName) {
        console.log("*************Signing up user******************");
        console.log(response.result.parameters);
        // getting params from api ai response message
        var params = {
            "UserId": message.user,
            "Name": userName,
            "Weight": response.result.parameters.Weight,
            "Height": response.result.parameters.Height,
            "Age": response.result.parameters.Age,
            "Gender": response.result.parameters.Gender,
            "activityLevel": response.result.parameters.ActivityLevel,
        };

        calculateCaloriesGoal(params);

        registerationService.signUpUser(params, bot, message, response);
    },

		showConsultants(bot, message, response) {
			console.log("****************** fetching all available consultants***************");
			consultantService.getAllConsultants(bot, message, response);
		},

		hireConsultant(bot, message, consultantName, id, userName) {
			console.log("***************** creating WEBEX Room for consultant and user*******************");
			webexService.setupMeeting(bot, message, consultantName, id, userName);
		},

    trackCalories: function (bot, message, response, userName) {
        console.log(response.result.parameters);
        console.log(userName);
        console.log(message);

        var params = {
            "UserId": message.user,
            "FoodInfo": response.result.parameters.FoodInfo,
        }

        caloriesTrackingService.recordCalories(params, bot, message, response);
    },

    trackExercise: function(bot, message, response, userName) {
        console.log("****************Track Exercise*******************");
        console.log(response.result.parameters);

        var params = {
            "UserId": message.user,
            "Query": response.result.parameters.exerciseInfo
        };

        trackExerciseService.addActivity(params, bot, message);
    }
}

function calculateCaloriesGoal(params) {
    if (params) {
        let weight = parseInt(params.Weight);
        let height = parseInt(params.Height);
        let age = parseInt(params.Age);
        let activityLevel = parseInt(params.activityLevel);
        let bmr = 0;
        if (params.Gender === 'M' || params.Gender === 'male' || params.Gender === 'Male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        params.caloriesGoal = bmr * activityLevelMap[activityLevel];
    }
}