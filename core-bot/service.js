var request = require('request');
var serviceURL = "http://service:3001";

var registerationService = require('../serviceManager/registeration/registeration.js');
var caloriesTrackingService = require('../serviceManager/calorieTracking/calorieTracking');
var trackExerciseService = require('../serviceManager/exerciseTracking/exerciseTracking.js');
var suggestFoodsService = require('../serviceManager/suggestFoods/suggestFoods.js');
var consultantService = require('../serviceManager/consultantServiceManager/consultantService.js');
var webexService = require('../serviceManager/webexServiceManager/webexService.js');

const activityLevelMap = {
    1: 1.2,
    2: 1.375,
    3: 1.55,
    4: 1.725,
    5: 1.9
};

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
            "email": response.result.parameters.email
        };

        calculateCaloriesGoal(params);

        registerationService.signUpUser(params, bot, message, response);
    },

    showConsultants(bot, message, response) {
        console.log("****************** fetching all available consultants***************");
        consultantService.getAllConsultants(bot, message, response);
    },

    hireConsultant(bot, message, consultantName, id, daySelected, userName) {
        console.log("***************** creating WEBEX Room for consultant and user*******************");
        webexService.setupMeeting(bot, message, consultantName, id, daySelected, userName);
    },

    trackCalories: function(bot, message, response, userName) {
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

        var params = {
            "UserId": message.user,
            "Query": response.result.parameters.exerciseInfo
        };

        trackExerciseService.addActivity(params, bot, message);
    },

    suggestFoods: function(bot, message, response, userName) {
        console.log("************Food Suggestions*********************");

        console.log('SuggestFoods: Finding the user details');
        var params = {
            "User": message.user,
            "ZipCode": response.result.parameters.zipCode
        }
        suggestFoodsService.getSuggestions(params, bot, message);
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
