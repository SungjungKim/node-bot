'use strict';

var date = require('../date'),
    log = require('../log')(module),
    fs = require('fs'),
    mongoose = require('mongoose'),
    fileSchema = mongoose.model('File');

var mecab = require('mecab-ffi'),
    TfIdf = require('node-tfidf');

function Image (fileName, path, score) {
    this.fileName = fileName;
    this.path = path;
    this.score = score;
}

exports.photos = function (req, res) {
    var message = req.params.message;
    console.log(date + '/photos/' + message);

    // NLP
    mecab.extractSortedNounCounts(message, function(err, result) {
        if (err) {
            log.info(date + ': [-] Failed to extract nouns. error:' + err);
            console.log(date + ': [-] Failed to extract nouns. error:' + err);
        }
        else {
            // Todo 0. make noun list
            var nouns = [];
            result.forEach(function (item) {
                nouns.push(item.noun.toString().replace(/\s/g, ''));
            });
            console.log(nouns);
            if (nouns.length == 0) nouns.push(message);

            if (nouns.toString().indexOf("토렌트") != -1) {
                var JSONObject = {};
                JSONObject.response = 201;
                JSONObject.nouns = nouns;
                JSONObject.photos = null;
                JSONObject.torrents = 1;
                //console.log("response: " + JSONObject.response);

                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(JSONObject));
            }
            else {
                // Todo 1. DB.find({type: 'image'})
                fileSchema.find({type: "image"}, function (err, files) {
                    if (err) {
                        log.info(date + '[-] Failed to find files. error:' + err);
                    }
                    else {
                        // Todo 2. tfidf.addDocument(tag) - [{fileName, path, score}, {...}, ...]
                        var tfidf = new TfIdf(),
                            images = [],
                            average = 0,
                            count = 1;
                        files.forEach(function (image) {
                            var fileName = image.fileName,
                                filePath = image.path,
                                tags = image.tag.toString().replace(/\s/g, '').split(",");
                            //console.log(tags);
                            images.push(new Image(fileName, filePath, 0));
                            tfidf.addDocument(tags);
                        });

                        tfidf.tfidfs(nouns, function(i, score) {
                            images[i].score = score;
                        });

                        // Todo 4. order by score(tfidf value)
                        images.sort(function(a, b){
                            return a.score > b.score ? -1 : a.score < b.score ? 1 : 0;
                        });

                        images.forEach(function (image) {
                            //console.log(image.fileName + ' ' + image.path + ' ' + image.score);
                            count++;
                            average += image.score;
                        });
                        average /= count;

                        // Todo 5. make JSON Object which contains nouns and images.
                        var JSONObject = {},
                            photoNames = [],
                            photos = [];
                        // Todo 5-1. add list of nouns to JSON Object
                        JSONObject.nouns = nouns;
                        // Todo 5-2. add photos above the score average to JSON Object.
                        var selectPhotos = new Promise(function (resolve) {
                            images.forEach(function (image, i) {
                                if (average >= image.score || i >= count) return true;

                                var fileName = image.fileName,
                                    path = image.path,
                                    score = image.score;
                                photoNames.push(fileName);
                                fs.exists(path, function (exists) {
                                    if (exists) {
                                        var data = fs.readFileSync(path);
                                        photos.push(new Buffer(data).toString('base64'));
                                        log.info(fileName + ': '+ score);
                                    }
                                    else {
                                        log.info(date + 'file is not exists: ' + fileName + '(' + path + ') ' + score);
                                    }
                                });
                            });
                            setTimeout(function () {
                                resolve(photos.length);
                            });
                        });

                        selectPhotos.then(function (result) {
                            console.log("photos: " + result);
                            if (result == 0) {
                                JSONObject.response = 404;
                                JSONObject.photoNames = null;
                                JSONObject.photos = null;
                                //console.log("response: " + JSONObject.response);
                            }
                            else {
                                JSONObject.response = 200;
                                JSONObject.photoNames = photoNames;
                                JSONObject.photos = photos;
                                //console.log("response: " + JSONObject.response);
                            }
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                            res.setHeader('Access-Control-Allow-Credentials', true);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify(JSONObject));

                        });
                    }
                });

            }

        }
    });
}