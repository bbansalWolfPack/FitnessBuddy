var connection = require('../connect.js');

var mongoose = connection.connection;

Schema = mongoose.Schema;

var KeySchema = new Schema({

    UserId: {
        type: String,
        index: true
    },
    foodInfo: String,
    calories: Number,
    timestamp: Date
}, {collection: 'CalorieRecords'});

var CalorieRecord = mongoose.model('CalorieRecord', KeySchema);