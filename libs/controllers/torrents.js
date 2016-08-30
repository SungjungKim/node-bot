var rangeParser = require('range-parser'),
    pump = require('pump'),
    _ = require('lodash'),
    express = require('express'),
    multipart = require('connect-multiparty'),
    fs = require('fs'),
    libs = process.cwd() + '/libs/';

var store = require(libs + 'torrents/store'),
    progress = require(libs + 'torrents/progressbar'),
    stats = require(libs + 'torrents/stats');

var date = require('../date'),
    log = require('../log')(module);

function serialize(torrent) {
    if (!torrent.torrent) {
        return { infoHash: torrent.infoHash };
    }
    var pieceLength = torrent.torrent.pieceLength;

    return {
        infoHash: torrent.infoHash,
        name: torrent.torrent.name,
        interested: torrent.amInterested,
        ready: torrent.ready,
        files: torrent.files.map(function (f) {
            // jshint -W016
            var start = f.offset / pieceLength | 0;
            var end = (f.offset + f.length - 1) / pieceLength | 0;

            return {
                name: f.name,
                path: f.path,
                link: '/torrents/' + torrent.infoHash + '/files/' + encodeURIComponent(f.path),
                length: f.length,
                offset: f.offset,
                selected: torrent.selection.some(function (s) {
                    return s.from <= start && s.to >= end;
                })
            };
        }),
        progress: progress(torrent.bitfield.buffer)
    };
}


exports.getList = function (req, res) {
    res.send(store.list().map(serialize));
}

exports.add = function (req, res) {
    store.add(req.body.link, function (err, infoHash) {
        if (err) {
            console.error(err);
            res.send(500, err);
        }
        else {
            res.send({ infoHash: infoHash });
        }
    });
}

exports.getHash = function (req, res) {
    res.send(serialize(req.torrent));
}

exports.start = function (req, res) {
    var index = parseInt(req.params.index);
    if (index >= 0 && index < req.torrent.files.length) {
        req.torrent.files[index].select();
    }
    else {
        req.torrent.files.forEach(function (f) {
            f.select();
        });
    }
    res.send(200);
}

exports.stop = function (req, res) {
    var index = parseInt(req.params.index);
    if (index >= 0 && index < req.torrent.files.length) {
        req.torrent.files[index].deselect();
    }
    else {
        req.torrent.files.forEach(function (f) {
            f.deselect();
        });
    }
    res.send(200);
}

exports.pause = function (req, res) {
    req.torrent.swarm.pause();
    res.send(200);
}

exports.resume = function (req, res) {
    req.torrent.swarm.resume();
    res.send(200);
}

exports.delete = function (req, res) {
    store.remove(req.torrent.infoHash);
    res.send(200);
}

exports.getStats = function (req, res) {
    res.send(stats(req.torrent));
}

exports.getFiles = function (req, res) {
    var torrent = req.torrent;
    res.setHeader('Content-Type', 'application/x-mpegurl; charset=utf-8');
    res.send('#EXTM3U\n' + torrent.files.map(function (f) {
            return '#EXTINF:-1,' + f.path + '\n' +
                req.protocol + '://' + req.get('host') + '/torrents/' + torrent.infoHash + '/files/' + encodeURIComponent(f.path);
        }).join('\n'));
}

exports.all = function (req, res) {
    var torrent = req.torrent, file = _.find(torrent.files, { path: req.params.path });

    if (!file) {
        return res.send(404);
    }

    if (typeof req.query.ffmpeg !== 'undefined') {
        return require('./ffmpeg')(req, res, torrent, file);
    }

    var range = req.headers.range;
    range = range && rangeParser(file.length, range)[0];
    res.setHeader('Accept-Ranges', 'bytes');
    res.type(file.name);
    req.connection.setTimeout(3600000);

    if (!range) {
        res.setHeader('Content-Length', file.length);
        if (req.method === 'HEAD') {
            return res.end();
        }
        return pump(file.createReadStream(), res);
    }

    res.statusCode = 206;
    res.setHeader('Content-Length', range.end - range.start + 1);
    res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + file.length);

    if (req.method === 'HEAD') {
        return res.end();
    }
    pump(file.createReadStream(range), res);
}