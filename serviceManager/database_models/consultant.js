var connection = require('../connect.js');

var mongoose = connection.connection;

Schema = mongoose.Schema;

var ConsultantSchema = new Schema({

  UserId: {
    type: String,
    index: true
  },
  name: String,
  Gender: String,
  type: String,
  numberOfSlotsAvailable: Number,
  daysAvailable: String,
  packagePrice: Number,
  expertise: String,
  webexId: String,
  email: String,

}, {collection: 'Consultant'});

var Consultant = mongoose.model('Consultant', ConsultantSchema);
