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

var router = express.Router(),
    controller = require(libs + 'controllers/torrents.js');

function findTorrent(req, res, next) {
    var torrent = req.torrent = store.get(req.params.infoHash);
    if (!torrent) {
        return res.send(404);
    }
    next();
}

router.get('/', controller.getList);

router.post('/', controller.add);

router.get('/:infoHash', findTorrent, controller.getHash);

router.post('/:infoHash/start/:index?', findTorrent, controller.start);

router.post('/:infoHash/stop/:index?', findTorrent, controller.stop);

router.post('/:infoHash/pause', findTorrent, controller.pause);

router.post('/:infoHash/resume', findTorrent, controller.resume);

router.delete('/:infoHash', findTorrent, controller.delete);

router.get('/:infoHash/stats', findTorrent, controller.getStats);

router.get('/:infoHash/files', findTorrent, controller.getFiles);

router.all('/:infoHash/files/:path([^"]+)', findTorrent, controller.all);

module.exports = router;
