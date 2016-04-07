var mongo = require('mongoskin');
var express = require('express');
var router = express.Router();
var Parse = require('csv-parse');
var fs = require('fs')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var async = require('async');

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function parseCSVFile(sourceFilePath, columns, onNewRecord, handleError, done, db) {
    var source = fs.createReadStream(sourceFilePath);

    console.log('stream created');

    var linesRead = 0;

    var parser = Parse({
        delimiter: ',',
        columns: columns
    });

    parser.on("readable", function () {
        var record;
        while (record = parser.read()) {
            linesRead++;
            onNewRecord(record, db);
        }
    });

    parser.on("error", function (error) {
        handleError(error)
    });

    parser.on("end", function () {
        done(linesRead);
    });

    source.pipe(parser);
}

function onNewRecord(record, db) {
    db.collection('guests').findOne({ 'email': record.email }, function (err, guest) {
        //check if email already exists
        if (!guest) {
            //generate and check random number
            var random = Math.floor((Math.random() * 1000) + 1);
            var randomExist = false;
            do {
                random = pad(random, 4);
                db.collection('guests').findOne({ 'number': random }, function (err, guest) {
                    if (guest) {
                        randomExist = true;
                        random = Math.floor((Math.random() * 1000) + 1);
                    }
                    else {
                        randomExist = false;
                    }
                });
            }
            while (randomExist);

            record.number = random
            record.sent = false;

            db.collection('guests').insert(record);
        }
    });

}

/* GET home page. */
router.get('/guests/list', function (req, res) {
    var db = req.db;
    db.collection('guests').find().toArray(function (err, items) {
        console.log(items.length);
        res.json(items);
    });
});

router.get('/guests/list/:id', function (req, res) {
    var db = req.db;
    var prodId = req.params.id;
    db.collection('guests').find(
            { '_id': prodId }
        ).toArray(function (err, items) {
            res.json(items);
        });
});

router.post('/guests/list', function (req, res) {
    console.log(req.body[4]);
    var db = req.db;
    async.forEach(req.body, function (guest) {
        //console.log('updating: ' + guest._id);
        //var id = mongo.helper.toObjectID(guest._id);

        //db.collection('guests').update({
        //    _id: id
        //},
        //{
        //    '$set': {
        //        number: guest.number,
        //        name: guest.name,
        //        email: guest.email,
        //        sent: guest.sent,
        //        quantity: parseInt(guest.quantity),
        //        kids_quantity: parseInt(guest.kids_quantity),
        //        confirmed: guest.confirmed,
        //        quantity_confirmed: parseInt(guest.quantity_confirmed),
        //        kids_quantity_confirmed: parseInt(guest.kids_quantity_confirmed),
        //        confirmed_date: guest.confirmed_date
        //    }
        //},
        //function (err, result) {
        //    if (err) throw err;
        //    if (result) {
        //        console.log('Updated!')
        //        res.json({ message: 'Updated!' });
        //    };
        //});
    });
});

router.get('/guests/clear', function (req, res) {
    console.log('limpiando vacios');
    var db = req.db;

    db.collection('guests').remove({ Nombre: {$exists: true} }, function (err, result) {
        if (err) throw err;
        if (result) {
            console.log('Updated!')
            res.json({ message: 'Updated!' });
        };
    });
})

router.get('/guests/status', function (req, res) {
    var db = req.db;

    //adults
    db.collection('guests').aggregate([{
        $group: {
            _id: null,
            adults: { $sum: '$quantity_confirmed' },
            adultsTotal: { $sum: '$quantity' },
            kids: { $sum: '$kids_quantity_confirmed' },
            kidsTotal: { $sum: '$kids_quantity' },
            sent: { $sum: { $cond: ['$sent', 1, 0] } },
            notSent: { $sum: { $cond: ['$sent', 0, 1] } },
            confirmed: { $sum: { $cond: [{ $eq: ["$confirmed", 'yes'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$confirmed", 'no'] }, 1, 0] } },
            kidsRejected: { $sum: { $multiply: [{ $cond: [{ $eq: ["$confirmed", 'no'] }, 1, 0] }, '$kids_quantity'] } },
            adultsRejected: { $sum: { $multiply: [{ $cond: [{ $eq: ["$confirmed", 'no'] }, 1, 0] }, '$quantity'] } },
        }
    }],
    function (err, result) {
        if (err) {
            console.log(err)
            res.json();
        }
        
        if (result && result.length >= 1) {
            console.log(result[0]);
            res.json(result[0]);
        }
        
        res.json();
    });

    //Async.parallel([
    //    //not sent
    //    function (callback) {
    //        db.collection('guests').count({ sent: false }, function (err, result) {
    //            callback(null, result);
    //        });
    //    },

    //    //sent
    //    function (callback) {
    //        db.collection('guests').count({ sent: true }, function (err, result) {
    //            callback(null, result);
    //        });
    //    },

    //    //confirmed
    //    function (callback) {
    //        db.collection('guests').count({ confirmed: true }, function (err, result) {
    //            callback(null, result);
    //        });
    //    },

       
    //])
    
});
function onError(error) {
    console.log(error)
}

function done(linesRead) {
    console.log('Done');
}

router.post('/guests/multiload', multipartMiddleware, function (req, res) {
    console.log('ok');
    console.log(req.files);
    console.log(req.files.file.path);
    var columns = true;
    parseCSVFile(req.files.file.path, columns, onNewRecord, onError, done, req.db);

    res.json({ message: 'Updated!' });
});

router.post('/guests/list/:_id', function (req, res) {
    var db = req.db;

    var quantity_confirmed = parseInt(req.body.quantity_confirmed) || 0;
    var kids_quantity_confirmed = parseInt(req.body.kids_quantity_confirmed) || 0;

    console.log('confirmed: ' + req.body.confirmed);
    var confirmed = req.body.confirmed;

    if (!confirmed) { //there's no value
        confirmed = 'pending';
    }

    if (confirmed == 'no') { //if it cancels, we zero the confirm values
        console.log('amargo');
        quantity_confirmed = 0;
        kids_quantity_confirmed = 0;
    }
    db.collection('guests').update({
        _id: mongo.helper.toObjectID(req.body._id)
    },
    {
        '$set': {
            number: req.body.number,
            name: req.body.name,
            email: req.body.email,
            sent: req.body.sent,
            quantity: parseInt(req.body.quantity) || 0,
            kids_quantity: parseInt(req.body.kids_quantity) || 0,
            confirmed: confirmed,
            quantity_confirmed: quantity_confirmed,
            kids_quantity_confirmed: kids_quantity_confirmed,
            confirmed_date: req.body.confirmed_date
        }
    }, function (err, result) {
        if (err) throw err;
        if (result) {
            console.log('Updated!')
            res.json({ message: 'Updated!' });
        };
    });
});

module.exports = router;