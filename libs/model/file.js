var mongoose = require('mongoose'),
    log = require('../log')(module);

var Schema = mongoose.Schema,
    fileSchema = new Schema({
    fileName: String,
    type: String,
    tag: String,
    path: String,
    time: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('File', fileSchema);