var rangeParser = require('range-parser'),
    pump = require('pump'),
    _ = require('lodash'),
    express = require('express'),
    multipart = require('connect-multiparty'),
    fs = require('fs'),
    libs = process.cwd() + '/libs/',
    db = require(libs + 'db/mongoose');

var store = require(libs + 'torrents/store'),
    progress = require(libs + 'torrents/progressbar'),
    stats = require(libs + 'torrents/stats');

var router = express.Router(),
    controller = require(libs + 'controllers/uploads.js');

router.post('/', multipart(), controller.uploads);

module.exports = router;
