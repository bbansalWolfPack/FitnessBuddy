var connection = require('../connect.js');

var mongoose = connection.connection;

Schema = mongoose.Schema;

var KeySchema = new Schema({

  UserId: {
    type: String,
    index: true
  },
  Name: String,
  Gender: String,
  Weight: Number,
  Height: Number,
  age: Number,
  caloriesGoal: Number,
  activityLevel: Number,

}, {collection: 'Users'});

var User = mongoose.model('User', KeySchema);
