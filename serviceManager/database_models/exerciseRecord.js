var connection = require('../connect.js');

var mongoose = connection.connection;

Schema = mongoose.Schema;

var KeySchema = new Schema({

    ExerciseId: {
        type: String,
        index: true
    },
    UserId: String,
    ExerciseInfo: String,
    Calories: Number,
    Timestamp: String,
    ActivityName: String,
    ActivityDuration: Number,
    Met: Number
}, {
    collection: 'ExerciseRecords',
    autoIndex: true,
});

var ExerciseRecord = mongoose.model('ExerciseRecord', KeySchema);
