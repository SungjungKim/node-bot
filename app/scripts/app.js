'use strict';

angular
    .module('chatplinTorrentApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'btford.socket-io',
        'angularFileUpload'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function () {
        window.addEventListener('dragover', function (e) {
            e.preventDefault();
        }, false);
        window.addEventListener('drop', function (e) {
            e.preventDefault();
        }, false);
    });
