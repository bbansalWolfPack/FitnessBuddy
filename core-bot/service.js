var request = require('request');
var serviceURL  = "http://service:3001";

var registerationService = require('../serviceManager/registeration/registeration.js');
var caloriesTrackingService = require('../serviceManager/calorieTracking/calorieTracking');
const activityLevelMap = {1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5:1.9};
module.exports = {

	registerUser: function (bot, message, response, userName) {
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

	trackCalories: function (bot, message, response, userName) {
        console.log(response.result.parameters);
        console.log(userName);
        console.log(message);

        var params = {
            "UserId": message.user,
            "FoodInfo": response.result.parameters.FoodInfo,
            //"calories": response.result.parameters.
        }

        caloriesTrackingService.recordCalories(params, bot, message, response);
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
      bmr = (10 * weight) + (6.25 * height) - (5 * age) -161;
    }

    params.caloriesGoal = bmr * activityLevelMap[activityLevel];
  }
}
