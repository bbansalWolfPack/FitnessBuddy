var mongoose = require('mongoose');
var needle = require("needle");

var User = mongoose.model('User');
var CalorieRecord = mongoose.model('CalorieRecord');

exports.getSuggestions = function(params, bot, message) {
    headers = {
        'Content-Type': 'application/json',
        'x-app-id': '9c250223',
        'x-app-key': '2b092179ca3c8bf485111b6093c9a97b',
        'x-remote-user-id': 0
    };

    User.findOne({
        "UserId": params.User
    }, function(err, User) {
        if (err) {
            console.log('SuggestFoods: Error in DB.');
        } else if (User) {
            console.log('SuggestFoods: User found.');
            params.User = User;
            getSuggestionsOnMap(params, bot, message);
        } else {
            console.log('SuggestFoods: No User found in DB');
            bot.reply(message, "Please Sign Up before using this service.")
        }
    });
}

function getSuggestionsOnMap(params, bot, message) {
    console.log('SuggestFoods: Getting Calorie Deficit');
    var d = new Date(0);
    d.setUTCSeconds(message.ts - 4 * 60 * 60);

    let totalCaloriesConsumed = 0;

    CalorieRecord.find({
        "userId": params.User.UserId,
        "timestamp": d.toISOString().substring(0, 10)
    }, function(err, result) {
        result.forEach((calorieRecord) => {
            console.log(calorieRecord.calories);
            totalCaloriesConsumed = totalCaloriesConsumed + calorieRecord.calories;
        });
        bot.reply(message, `You have consumed ${totalCaloriesConsumed} kCal today.`);
        if (totalCaloriesConsumed > params.User.caloriesGoal) {
            bot.reply(message, "Hmmm.. You have already crossed you daily kCal intake limit of " + params.User.caloriesGoal + " kCal.");
        } else {
            bot.reply(message, "Hmmm.. You have a calorie intake deficit of " + (params.User.caloriesGoal - totalCaloriesConsumed) + " kCal for today.");
            getFoodSuggestionsOnMap(bot, message, params.ZipCode, (params.User.caloriesGoal - totalCaloriesConsumed));
        }
    });
}

function getFoodSuggestionsOnMap(bot, message, zipcode, deficit) {
    console.log('SuggestFoods: Searching nearby restaurants.');
    headers = {
        'Content-Type': 'application/json',
        'x-app-id': '9c250223',
        'x-app-key': '2b092179ca3c8bf485111b6093c9a97b',
        'x-remote-user-id': 0
    };

    needle.get("https://www.zipcodeapi.com/rest/Bvse1cMUvTKAVIvfuRH2d4d5UdmvG15cRS9xQoifWyGS8pni6QSSp29cP59cAksV/info.json/" + zipcode + "/degrees", function(err, resp, body) {
        if (err) {
            console.log('SuggestFoods: API error.');
        } else {
            latitude = resp.body.lat;
            longitude = resp.body.lng;
            location = resp.body.city + ", " + resp.body.state
            bot.reply(message, "Looking for healthy food options in 2 mile radius of " + location);
            needle.get("https://trackapi.nutritionix.com/v2/locations?ll=" + latitude + "," + longitude + "&distance=2mi", {
                headers: headers
            }, function(err, resp, body) {
                if (err) {
                    console.log('SuggestFoods: API error.');
                } else {
                    var locations = resp.body.locations.slice(0, 3);
                    bot.reply(message, "Here are some food suggestions that can help you cover the deficit");
                    locations.forEach((location) => {
                        needle.post("https://trackapi.nutritionix.com/v2/search/instant", {
                            "query": location.name,
                            "full_nutrients": {
                                "208": {
                                    "lte": deficit
                                }
                            },
                            "self": false,
                            "branded": true,
                            "brand_ids": [location.brand_id],
                            "common": true,
                            "common_grocery": false,
                            "common_restaurant": true,
                            "detailed": false
                        }, {
                            headers: headers,
                            json: true
                        }, function(err, resp, body) {
                            if (err) {
                                console.log('SuggestFoods: API error.');
                            } else {
                                var foods = resp.body.branded.filter(food => food.hasOwnProperty('nf_calories'));
                                foods.sort(function(x, y) {
                                    if (x.serving_qty != y.serving_qty) {
                                        return x.serving_qty - y.serving_qty;
                                    } else if (x.nf_calories != y.nf_calories) {
                                        return y.nf_calories - x.nf_calories;
                                    } else {
                                        return 0;
                                    }
                                });
                                foods = foods.slice(0, 3);
                                foods.forEach((food) => {
                                    console.log(food);
                                    bot.reply(message, {
                                        username: 'fitness-buddy',
                                        text: 'https://www.google.com/maps/@' + location.lat + ',' + location.lng + ',17z',
                                        attachments: [{
                                            "fallback": food.food_name,
                                            "color": "#7CD197",
                                            "author_name": food.brand_name,
                                            "author_link": location.website,
                                            "title": food.food_name,
                                            "text": "Serving Unit - " + food.serving_unit,
                                            "fields": [{
                                                "title": "KCalories",
                                                "value": food.nf_calories
                                            }],
                                            "thumb_url": food.photo.thumb,
                                            "footer": "Suggestion by fitness-buddy",
                                            "ts": message.ts
                                        }]
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
    });
}
