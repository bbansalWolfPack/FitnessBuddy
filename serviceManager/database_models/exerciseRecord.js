var connection = require('../connect.js');

var mongoose = connection.connection;

Schema = mongoose.Schema;

var KeySchema = new Schema({

    UserId: {
        type: String,
        index: true
    },
    exerciseInfo: String,
    calories: String
}, {collection: 'ExerciseRecords'});

var ExerciseRecord = mongoose.model('ExerciseRecord', KeySchema);
