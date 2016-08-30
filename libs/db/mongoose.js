var mongoose = require('mongoose');

var libs = process.cwd() + '/libs/',
	log = require(libs + 'log')(module),
	config = require(libs + 'config'),
	fs = require('fs');

mongoose.connect(config.get('mongoose:uri'));

var db = mongoose.connection,
    modelPath = libs + 'model/',
    models = fs.readdirSync(modelPath);

models.forEach(function (file) {
	require(modelPath + '/' + file);
})

db.on('error', function (err) {
	log.error('Connection error:', err.message);
});

db.once('open', function callback () {
	log.info("Connected to DB!");
});

module.exports = mongoose;
