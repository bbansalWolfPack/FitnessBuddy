require('../database_models/exerciseRecord.js');
var mongoose = require('mongoose');
var needle = require("needle");

var ExerciseRecord = mongoose.model('ExerciseRecord');
var User = mongoose.model('User');

exports.addActivity = function(params, bot, message) {
    headers = {
        'Content-Type': 'application/json',
        'x-app-id': '9c250223',
        'x-app-key': '2b092179ca3c8bf485111b6093c9a97b',
        'x-remote-user-id': 0
    };

    console.log('TrackExercise: Finding the user details');
    User.findOne({
        UserId: params.UserId
    }, function(err, User) {
        if (err) {
            console.log('TrackExercise: Error in DB.');
        } else if (User) {
            console.log('TrackExercise: User found.');

            var body = {};
            body.query = params.Query;
            if (User.Gender == 'M') {
                body.gender = 'male';
            } else if (User.Gender == 'F') {
                body.gender = 'female';
            }
            body.weight_kg = User.Weight;
            body.height_cm = User.Height;
            body.age = User.Age;

            needle.post("https://trackapi.nutritionix.com/v2/natural/exercise", body, {
                headers: headers,
                json: true
            }, function(err, resp, body) {
                if (err) {
                    console.log('TrackingExercise: Error sending request to API.');
                } else {
                    console.log(resp.body);
                    for (var exercise in resp.body.exercises) {
                        var d = new Date(0);
                        d.setUTCSeconds(message.ts - 4 * 60 * 60);
                        //d = new Date(d.getFullYear(),d.getMonth(),d.getDate());
                        var record = {}
                        record.UserId = User.UserId;
                        record.ExerciseInfo = params.Query;
                        record.Calories = resp.body.exercises[exercise].nf_calories;
                        record.Timestamp = d.toISOString().substring(0, 10);
                        record.ActivityName = resp.body.exercises[exercise].name;
                        record.ActivityDuration = resp.body.exercises[exercise].duration_min;
                        record.Met = resp.body.exercises[exercise].met;

                        ExerciseRecord.create(record, {
                            'upsert': true,
                            'new': true
                        }, function(err, ExerciseRecord) {
                            if (err) {
                                console.log('TrackExercise: Error in DB.');
                            } else if (ExerciseRecord) {
                                console.log('TrackExercise: Exercise Recorded.');
                                console.log(ExerciseRecord);
                                bot.reply(message, "You burnt " + resp.body.exercises[exercise].nf_calories + " calories in " + resp.body.exercises[exercise].name);
                            }
                        });
                    }
                }
            });
        } else {
            console.log('TrackExercise: No User found in DB. Will not give accurate caloriecount.');
            needle.post("https://trackapi.nutritionix.com/v2/natural/exercise", {
                "query": params.Query
            }, {
                headers: headers,
                json: true
            }, function(err, resp, body) {
                console.log(resp.body);
                bot.reply(message, "Good Job! You burnt " + resp.body.exercises[0].nf_calories + " calories.");
            });
        }
    });
};
