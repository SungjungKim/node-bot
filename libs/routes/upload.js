var express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    libs = process.cwd() + '/libs/',
    db = require(libs + 'db/mongoose'),
    controller = require(libs + 'controllers/upload.js'),
    upload = multer({ dest: 'storage' });

router.post('/', upload.single('upload'), controller.upload);

module.exports = router;
