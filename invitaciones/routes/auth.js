var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');

router.post('/backend-login', function (req, res) {
    var db = req.db;
    var email = req.body.usr;
    var pass = req.body.pass;
    //console.log(req);
    console.log(email);
    console.log(pass);

    db.collection('administrators').findOne({ 'email': email }, function (err, user) {
        if (err) {
            res.send(401, "Ocurrio un error al intentar ingresar.");
            return;
        }

        if (!user) {
            res.send(401, "Credenciales no validas.");
            return;
        }

        if (user.password != pass) {
            res.send(401, "Credenciales no validas.");
            return;
        }

        var guid = uuid.v4();
        var timestamp = Date.now();
        db.collection('administrators').updateById(user._id.toString(), { $set: { guid: guid, timestamp: timestamp } }, function (err) {
            res.send({
                accessToken: guid,
                usr: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                id: user._id
            });
        });

    });
});

module.exports = router;