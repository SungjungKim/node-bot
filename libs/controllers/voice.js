var date = require('../date'),
    log = require('../log')(module);
var io, bluetooth, speech;

var musics = [
    new Music(0, false),
    new Music(1, false)
];

function Music(id, state) {
    this.id = id;
    this.state = state;
}

exports.voice = function (req, res) {
    var fs = require('fs'),
        mongoose = require('mongoose'),
        voiceSchema = mongoose.model('Voice');

    var mecab = require('mecab-ffi'),
        TfIdf = require('node-tfidf');

    if (!req.params.message) {
        log.info('[-] Message does not found.');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.writeHead(500, {'Content-Type': 'application/json; charset=utf-8'});
        res.end('Message does not found.');
        return;
    }

    var message = [];
    console.log(date + ' Message: ' + req.params.message);

    // Todo 0. parse the message to morpheme.
    var parseMessage = function (receivedMsg) {
        return new Promise(function (resolve, reject) {
            mecab.parse(receivedMsg, function(err, result) {
                if (err) {
                    log.info('[-] Failed to parse the message. error:' + err);
                    reject(err);
                }
                else {
                    result.forEach(function (morpheme) {
                        message.push(morpheme[0]);
                    });
                    console.log(message);
                    setTimeout(function () {
                        resolve();
                    });
                }
            });
        });
    }

    // Todo 1. DB.find({type: '0'})
    var selectDatas = function () {
        return new Promise(function (resolve, reject) {
            voiceSchema.find({}, function (err, commandSet) {
                if (err) {
                    log.info('[-] Failed to find datas. error:' + err);
                    reject(err);
                }
                else {
                    setTimeout(function () {
                        resolve(commandSet);
                    });
                }
            })
        });
    }

    // Todo 2. set tf-idf document(command).
    var tfidfOfCommand = null;
    var makeCommandSet = function (_commandSet) {
        return new Promise(function (resolve, reject) {
            if (!_commandSet) {
                reject(new Error(500, 'commandSet does not exist'));
            }
            else {
                tfidfOfCommand = new TfIdf();
                var Voice = {};
                var commandSet = [];
                _commandSet.forEach(function (command) {
                    var c = {};
                    c.type = command.type;
                    c.tag = command.tag.toString().replace(/\s/g, '').split(",");
                    //console.log(c.tag);
                    commandSet.push(c);
                    tfidfOfCommand.addDocument(c.tag);
                });
                setTimeout(function () {
                    Voice.commandSet = commandSet;
                    resolve(Voice);
                });
            }
        });
    }

    // Todo 3. calculate tf-idf value(command).
    var calculateCommandTFIDF = function (Voice) {
        return new Promise(function (resolve, reject) {
            if (!Voice || !tfidfOfCommand) {
                reject(new Error(500, 'dataSet/tfidf does not exist'));
            }
            else {
                tfidfOfCommand.tfidfs(message, function (i, score) {
                    Voice.commandSet[i].scoreOfCommand = score;
                });

                Voice.commandSet.sort(function(a, b){
                    return a.scoreOfCommand > b.scoreOfCommand ? -1 : a.scoreOfCommand < b.scoreOfCommand ? 1 : 0;
                });

                Voice.commandSet.forEach(function (command) {
                    console.log(command.type + ' ' + ' ' + command.scoreOfCommand);
                });

                setTimeout(function () {
                    resolve(Voice);
                });
            }
        });
    }

    // Todo 4. set tf-idf document(music)
    //var tfidfOfMusic = null;
    //var makeMusicSet = function (Voice) {
    //    return new Promise(function (resolve, reject) {
    //        fs.readdir(process.cwd() + '/view/audios/', function(err, files) {
    //            if (err || !Voice) {
    //                log.info('[-] Failed to get list of music name. error:' + err);
    //                reject(err);
    //            }
    //            else {
    //                tfidfOfMusic = new TfIdf();
    //                var musicSet = [];
    //                files.forEach(function (file) {
    //                    var result = mecab.parseSync(file.toString());
    //                    if (err) {
    //                        log.info('[-] Failed to parse the music name. error:' + err);
    //                        reject(err);
    //                    }
    //                    else {
    //                        var morphemeSet = [];
    //                        result.forEach(function (morpheme) {
    //                            if (isHangul(morpheme[0])) {
    //                                morphemeSet.push(morpheme[0]);
    //                            }
    //                        });
    //                        var m = {};
    //                        m.name = morphemeSet.toString().replace(/\s/g, '').split(',');
    //                        console.log('tttt: ' +m.name);
    //                        musicSet.push(m);
    //                        //tfidfOfMusic.addDocument(m.info);
    //                    }
    //                });
    //
    //                tfidfOfMusic.addDocument(['박효신', '야생화']);
    //                tfidfOfMusic.addDocument(['장범준', '벚꽃엔딩']);
    //
    //                setTimeout(function () {
    //                    Voice.musicSet = musicSet;
    //                    resolve(Voice);
    //                });
    //            }
    //        });
    //
    //    });
    //}

    // Todo 5. calculate tf-idf value(music).
    //var calculateMusicTFIDF = function (Voice) {
    //    return new Promise(function (resolve, reject) {
    //        if (!Voice || !tfidfOfMusic) {
    //            reject(new Error(500, 'Voice/tfidf does not exist.'));
    //        }
    //        else {
    //            tfidfOfMusic.tfidfs(message, function (i, score) {
    //                console.log('tfidfOfMusic ' + i + ': ' + score);
    //                Voice.musicSet[i].scoreOfMusic = score;
    //            });
    //
    //            Voice.musicSet.sort(function(a, b){
    //                return a.scoreOfMusic > b.scoreOfMusic ? -1 : a.scoreOfMusic < b.scoreOfMusic ? 1 : 0;
    //            });
    //
    //            Voice.musicSet.forEach(function (music) {
    //                console.log(music.name + ' ' + music.scoreOfMusic);
    //            });
    //
    //            setTimeout(function () {
    //                resolve(Voice);
    //            });
    //        }
    //    });
    //}

    // Todo 6. command to play the music.
    var playMusic = function (Voice) {
        return new Promise(function (resolve, reject) {
            if (!Voice) {
                reject(new Error(500, 'Voice does not exist.'));
            }
            else {
                var type = Voice.commandSet[0].type;

                switch (type) {
                    case '00':
                        if (musics[0].state) {
                            bluetooth.emit('stop', {
                                text:'Stop the music.',
                                musicId: musics[0].id
                            });
                            musics[0].state = false;
                            if (musics[0].id == 0) musics[0].id = 1;
                            else musics[0].id = 0;
                        }
                        break;
                    case '01':
                        if (!musics[0].state) {
                            bluetooth.emit('start', {
                                text:'Play the music.',
                                musicId: musics[0].id
                            });
                            speech.emit('stop', {
                                text:'Stop the music.',
                                musicId: musics[1].id
                            });
                            musics[0].state = true;
                            musics[1].state = false;
                            if (musics[1].id == 0) musics[1].id = 1;
                            else musics[1].id = 0;
                        }
                        break;
                    case '10':
                        if (musics[1].state) {
                            speech.emit('stop', {
                                text:'Stop the music.',
                                musicId: musics[1].id
                            });
                            musics[1].state = false;
                            if (musics[1].id == 0) musics[1].id = 1;
                            else musics[1].id = 0;
                        }
                        break;
                    case '11':
                        if (!musics[1].state) {
                            speech.emit('start', {
                                text:'Play the music.',
                                musicId: musics[1].id
                            });
                            bluetooth.emit('stop', {
                                text:'Stop the music.',
                                musicId: musics[0].id
                            });
                            musics[0].state = false;
                            musics[1].state = true;
                            if (musics[0].id == 0) musics[0].id = 1;
                            else musics[0].id = 0;
                        }
                        break;
                    default:
                        console.log('Nothing.');
                        break;
                }

                Voice.music = musics;

                setTimeout(function () {
                    resolve(Voice);
                });
            }
        });
    }

    // Todo 7. send the music information to hardware.(Color, Time)
    var sendLedInfo = function (ret) {
        return new Promise(function (resolve, reject) {
            //if (!ret.led) {
            //    reject(new Error(500, 'ret.led does not exist.'));
            //}
            //else {
            //    // send ret.led
            //
            //    resolve(ret);
            //}

            resolve(ret);
        });
    }

    // Todo 8. response to client side.
    var response = function (ret) {
        return new Promise(function (resolve, reject) {
            if (!ret) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end('error');
                reject(new Error(500, 'ret does not exist.'));
            }
            else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                console.log(JSON.stringify(ret));
                res.end(ret.name);

                resolve();
            }
        });
    }

    // Todo 9. execute the promise code.
    var receivedMsg = req.params.message;
    var promise = parseMessage(receivedMsg);
    promise
        .then(selectDatas)
        .then(makeCommandSet)
        .then(calculateCommandTFIDF)
        .then(playMusic)
        .then(sendLedInfo)
        .then(response)
        .then(console.log());
}

exports.audioSocket = function (server) {
    io = require('socket.io').listen(server);
    io.set('log level', 2);

    bluetooth = io.of('/bluetooth').on('connection', function (socket) {
        log.info('connected with bluetooth socket.');

        socket.on('disconnect', function () {
            log.info('disconnected with bluetooth socket.');
        });

        socket.on('good', function (res) {
            console.log('bluetooth result: ' + res.result);
        });
    });

    speech = io.of('/speech').on('connection', function (socket) {
        log.info('connected with speech socket.');

        socket.on('disconnect', function () {
            log.info('disconnected with speech socket.');
        });

        socket.on('response', function (res) {
            console.log('speech result: ' + res.result);
        });
    });
}

function isHangul(ch) {
    c = ch.charCodeAt(0);
    if( 0x1100<=c && c<=0x11FF ) return true;
    if( 0x3130<=c && c<=0x318F ) return true;
    if( 0xAC00<=c && c<=0xD7A3 ) return true;
    return false;
}