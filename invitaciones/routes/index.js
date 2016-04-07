var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.sendfile('./public/index.html');
});

router.get('/backend', function (req, res) {
    res.sendfile('./public/backend/index.html');
});

module.exports = router;