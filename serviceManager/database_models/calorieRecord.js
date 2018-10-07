var connection = require('../connect.js');

var mongoose = connection.connection;

Schema = mongoose.Schema;

var KeySchema = new Schema({

    FoodId: {
        type: String,
        index: true
    },
    "userId": String,
    "food_name": String,
    "serving_quantity": Number,
    "serving_unit": String,
    "calories": Number,
    "timestamp": String
}, {collection: 'CalorieRecords'});

var CalorieRecord = mongoose.model('CalorieRecord', KeySchema);
