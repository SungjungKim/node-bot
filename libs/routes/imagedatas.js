var express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    libs = process.cwd() + '/libs/',
    db = require(libs + 'db/mongoose'),
    controller = require(libs + 'controllers/imagedatas.js'),
    upload = multer({ dest: 'storage/data' });

router.post('/', upload.single('image'), controller.imagedatas);

module.exports = router;