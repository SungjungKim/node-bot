'use strict';

angular.module('chatplinTorrentApp')
    .factory('torrentSocket', function (socketFactory) {
        return socketFactory();
    });
