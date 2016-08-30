var fs = require('fs'),
    mongoose = require('mongoose'),
    voiceSchema = mongoose.model('Voice'),
    csv = require("fast-csv");

var date = require('../date'),
    log = require('../log')(module);

exports.voicedatas = function (req, res) {
    log.info('voicedatas API is called.');

    // Handlign voicedatas files
    var csvFileName = req.file.originalname || "???",
        separator = '/',
        oldPath = req.file.path,
        newPath = [process.cwd(), 'storage', 'data', csvFileName].join(separator),
        src = fs.createReadStream(oldPath),
        dest = fs.createWriteStream(newPath);

    src.pipe(dest);
    src.on('end', function () {
        fs.unlink(oldPath, function (err) {
            if (err) {
                log.info('[-] Failed to create file stream. error:' + err);
            }
        })
    });

    // Query to mongoDB
    var stream = fs.createReadStream(oldPath),
        filePath = [process.cwd(), 'storage'].join(separator);
    csv.fromStream(stream)
        .on('data', function (data) {
            //console.log(date + ' ' + data[0]);
            var type = data[0] || "???",
                tag = data[1] || "???";
            new voiceSchema({
                type: type,
                tag: tag
            }).save(function (err) {
                    if (err) {
                        log.info('[-] Failed to save schema. error:' + err);
                    }
                });
        })
        .on('end', function () {
            log.info('csv parsing is end.');
        });

    res.json({
        msg: csvFileName
    });
}