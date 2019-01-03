

jest.setTimeout(30000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;  //by default, monge does not use 
// it's promise,  we need to tell it to usethe global promise

mongoose.connect(keys.mongoURI, {useMongoClient: true});








