var connection = require('../connect.js');

var mongoose = connection.connection;

Schema = mongoose.Schema;

var KeySchema = new Schema({

  UserId: {
    type: String,
    index: true
  },
  Name: String,
  Weight: String,
  Height: String,
  age: Number

}, {collection: 'Users'});

var User = mongoose.model('User', KeySchema);
