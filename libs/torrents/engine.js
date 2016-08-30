'use strict';

var torrentStream = require('torrent-stream'),
    _ = require('lodash');

var date = require('../date'),
    log = require('../log')(module);

var BITTORRENT_PORT = 6889;

module.exports = function (torrent, opts) {
    var engine = torrentStream(torrent, _.clone(opts, true));

    engine.once('verifying', function () {
        var totalPieces = engine.torrent.pieces.length;
        var verifiedPieces = 0;

        console.log('[+] verifying ' + engine.infoHash);
        engine.files.forEach(function (file, i) {
            console.log('[+] ' + i + ' ' + file.name);
        });

        engine.on('verify', function () {
            if (++verifiedPieces === totalPieces) {
                engine.emit('finished');
                console.log('[+] finished ' + engine.infoHash);
            }
        });
    });

    engine.once('ready', function () {
        console.log('[+] ready ' + engine.infoHash);
        engine.ready = true;

        // select the largest file
        var file = engine.files.reduce(function (a, b) {
            return a.length > b.length ? a : b;
        });
        file.select();
    });

    engine.on('uninterested', function () {
        log.info(date + '[+] uninterested ' + engine.infoHash);
        console.log(date + '[+] uninterested ' + engine.infoHash);
    });

    engine.on('interested', function () {
        log.info(date + '[+] interested ' + engine.infoHash);
        console.log(date + '[+] interested ' + engine.infoHash);
    });

    engine.on('idle', function () {
        log.info(date + '[+] idle ' + engine.infoHash);
        console.log(date + '[+] idle ' + engine.infoHash);
    });

    engine.on('error', function (e) {
        log.info(date + '[-] error ' + engine.infoHash + ': ' + e);
        console.log(date + '[-] error ' + engine.infoHash + ': ' + e);
    });

    engine.once('destroyed', function () {
        log.info(date + '[+] destroyed ' + engine.infoHash);
        console.log(date + '[+] destroyed ' + engine.infoHash);
        engine.removeAllListeners();
    });

    engine.listen(BITTORRENT_PORT, function () {
        log.info('[+] listening ' + engine.infoHash + ' on port ' + engine.port);
        console.log('[+] listening ' + engine.infoHash + ' on port ' + engine.port);
    });

    return engine;
};