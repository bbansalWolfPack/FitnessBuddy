
require('../database_models/calorieRecord');
var mongoose = require('mongoose');
var nock = require("nock");
var needle = require('needle');

var CalorieRecord = mongoose.model('CalorieRecord');

exports.recordCalories = function (params, bot, message, response) {

    var userId = params.UserId;
    //console.log("post_keys : POST Request ")
    console.log(params);

    //let caloriesInfo = needle.post("https://trackapi.nutritionix.com/v2/natural/nutrients", {headers:headers});
    needle.post("https://trackapi.nutritionix.com/v2/natural/nutrients", {
        "query": params.FoodInfo
    }, {
        headers: headers,
        json: true
    }, function(err, resp, body) {

        let foods = resp.body.foods;

        foods.forEach((food) => {
            console.log(food);
            let utcSeconds = message.ts - 4*60*60;
            let d = new Date(0);
            d.setUTCSeconds(utcSeconds);

            console.log(d);
            //console.log(d.getDate());

            let caloriesInfo = {
                "userId": params.UserId,
                "food_name": food.food_name,
                "serving_quantity": food.serving_qty,
                "serving_unit": food.serving_unit,
                "calories": food.nf_calories,
                "timestamp": d.toISOString().substring(0,10)
            }


            console.log(caloriesInfo);
            CalorieRecord.create(caloriesInfo, function (err, caloriesInfo) {
                if (err) {
                    bot.reply(message, "Server Error, please try again after some time.")
                } else {
                    bot.reply(message, "Successfully tracked your calories.");
                }
            });
        });
    });
};

var headers = {
    'Content-Type' : 'application/json',
    'x-app-id' : '9c250223',
    'x-app-key' : '2b092179ca3c8bf485111b6093c9a97b',
    'x-remote-user-id' : '0'
};