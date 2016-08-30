var mongoose = require('mongoose'),
    log = require('../log')(module);

var Schema = mongoose.Schema,
    voiceSchema = new Schema({
        type: String,
        tag: String,
        time: {
            type: Date,
            default: Date.now
        }
    });

mongoose.model('Voice', voiceSchema);