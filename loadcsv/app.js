var Parse = require('csv-parse');
var fs = require('fs')
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/invitaciones');

var db = mongoose.connection;

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function parseCSVFile(sourceFilePath, columns, onNewRecord, handleError, done) {
    var source = fs.createReadStream(sourceFilePath);

    var linesRead = 0;

    var parser = Parse({
        delimiter: ',',
        columns: columns
    });

    parser.on("readable", function () {
        var record;
        while (record = parser.read()) {
            linesRead++;
            onNewRecord(record);
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

//We will call this once Multer's middleware processed the request
//and stored file in req.files.fileFormFieldName
var filePath = 'invitados.csv';

function onNewRecord(record) {
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

function onError(error) {
    console.log(error)
}

function done(linesRead) {
    console.log('Done');
}

var columns = true;
parseCSVFile(filePath, columns, onNewRecord, onError, done);

