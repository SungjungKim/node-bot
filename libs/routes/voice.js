var express = require('express');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var db = require(libs + 'db/mongoose');
var controller = require(libs + 'controllers/voice.js');

router.get('/:message', controller.voice);

module.exports = router;