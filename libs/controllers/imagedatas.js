var fs = require('fs'),
    mongoose = require('mongoose'),
    fileSchema = mongoose.model('File'),
    csv = require("fast-csv");

var date = require('../date'),
    log = require('../log')(module);

exports.imagedatas = function (req, res) {
    log.info('imagedatas API is called.');

    // Handling csv file
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
            //console.log(data[0]);
            var fileName = data[0] || "???",
                type = "image",//data[1] || "???",
                tag = data[1] || "???";
            new fileSchema({
                fileName: fileName,
                type: type || "???",
                tag: tag || "???",
                path: [filePath, fileName].join(separator)
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