var mongoose = require('mongoose'),
    log = require('../log')(module);

var Schema = mongoose.Schema,
    torrentSchema = new Schema({
        fileName: String,
        path: String,
        time: {
            type: Date,
            default: Date.now
        }
    });

mongoose.model('Torrent', torrentSchema);