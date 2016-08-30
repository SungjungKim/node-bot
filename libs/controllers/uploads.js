var pump = require('pump'),
    _ = require('lodash'),
    express = require('express'),
    multipart = require('connect-multiparty'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    libs = process.cwd() + '/libs/';

var store = require(libs + 'torrents/store'),
    progress = require(libs + 'torrents/progressbar'),
    stats = require(libs + 'torrents/stats');

var torrentSchema = mongoose.model('Torrent');

var date = require('../date'),
    log = require('../log')(module);

exports.uploads = function (req, res) {
    var file = req.files && req.files.file;
    if (!file) {
        return res.send(500, 'file is missing');
    }

    // Todo 1. Save the torrents file
    var fileName = req.files.file.originalFilename || "???",
        separator = '/',
        oldPath = req.files.file.path,
        newPath = [process.cwd(), 'storage', 'torrent', fileName].join(separator),
        src = fs.createReadStream(oldPath),
        dest = fs.createWriteStream(newPath);
    src.pipe(dest);

    // Todo 2. Insert the info of torrents file to mongoDB
    new torrentSchema({
        fileName: fileName,
        path: newPath
    }).save(function (err) {
            if (err) {
                log.info(date + '[-] Failed to save torrents schema.');
                console.log(date + '[-] Failed to save torrents schema.');
            }
        });

    store.add(file.path, function (err, infoHash) {
        if (err) {
            console.error(err);
            res.send(500, err);
        }
        else {
            res.send({ infoHash: infoHash });
        }
        fs.unlink(file.path);
    });
}