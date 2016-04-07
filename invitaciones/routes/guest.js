var mongo = require('mongoskin');
var express = require('express');
var router = express.Router();


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/* GET home page. */
router.get('/:id', function (req, res) {
    console.log('----------------------------------')
    var db = req.db;
    var id = req.params.id;
    console.log(id);
    db.collection('guests').findAndModify(
        { 'number': id }, //query
        [['_id', 'asc']],  // sort order
        { "$inc": { visit: 1 } }, //replacement
        {}, //options
        function (err, item) {
            if (err) {
                console.log('error');
                console.log(err);
                res.status(500).send('Por favor, verifica el nro de invitado');
            }
            else {
                console.log(item);
                if (!item.value) {
                    res.status(500).send('Por favor, verifica el nro de invitado');
                }
                else {
                    res.json(item.value);
                }
            }
        }
    );

    //db.collection('guests').findOne({ 'number': id }, function (err, item) {
    //    console.log(item);

        

    //    res.json(item);
    //});
       
});

router.post('/', function (req, res) {
    console.log('------------Saving----------------------')
    var db = req.db;
    var guest = req.body;

    if (guest._id && (typeof (guest._id) === 'string')) {
        console.log('Fixing id')
        guest._id = mongo.ObjectID.createFromHexString(guest._id)
    }

    //set confirmation date
    guest.confirmed_date = Date.now();

    console.log(guest);
    db.collection('guests').findAndModify(
        { number: guest.number }, //query
        [['_id', 'asc']],  // sort order
        guest, //replacement
        {'new': true}, //options
        function (err, item) {
            if (err) {
                console.log(err);
                res.status(500).send('Something broke!' + err);
            }
            else {
                console.log(item);
                if (!item.value) {
                    res.status(500).send('Por favor, verifica el nro de invitado');
                }
                else {
                    res.json(item.value);
                }
            }
        }
    );

});

module.exports = router;