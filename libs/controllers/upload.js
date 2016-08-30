var fs = require('fs'),
    mongoose = require('mongoose'),
    fileSchema = mongoose.model('File'),
    multer = require('multer');

var date = require('../date'),
    log = require('../log')(module);

exports.upload = function (req, res) {
    log.info(date + '[+] upload API is called.');
    console.log(req.file);

    var fileName = req.file.originalname || "???",
        separator = '/',
        oldPath = req.file.path,
        newPath = [process.cwd(), 'storage', 'torrent', fileName].join(separator),
        src = fs.createReadStream(oldPath),
        dest = fs.createWriteStream(newPath);
    src.pipe(dest);
    src.on('end', function () {
        fs.unlink(oldPath, function (err) {
            if (err) {
                console.log(err);
            }
        })
    });

    new fileSchema({
        fileName: fileName,
        type: req.body.type || "???",
        tag: req.body.tag || "???",
        path: newPath
    }).save(function (err) {
        if (err) {
            log.info(date + '[-] Failed to save schema.');
            console.log(date + '[-] Failed to save schema.');
        }
    });

    res.json({
        msg: fileName
    });
}