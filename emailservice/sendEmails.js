var dotenv = require('dotenv');
dotenv.load();

var sendgrid = require("sendgrid")(process.env.SENDGRID_API);
var mongoose = require('mongoose');


mongoose.connect(process.env.MONGOLAB_URI);

var db = mongoose.connection;

db.collection('guests').find({ sent: false }, function (err, items) {
    items.forEach(function (guest) {
        var email = new sendgrid.Email();
        email.addTo(guest.email);
        email.setFrom("casamientoceciguille@gmail.com");
        email.setSubject("Casamiento Ceci y Guille");
        email.setFromName('Ceci y Guille');
        email.setHtml(`
            Hola %name%!
            <br/><br/>
            Tenemos un anuncio! Despu&eacute;s de tanto tiempo... NOS CASAMOS!!!<br/>
            Y queremos invitarlos a festejar con nosotros.
            <br/>
            <br/>
            Toda la info.que necesitas saber para no perderte la fiesta y confirmarnos tu presencia est&aacute;: <span style="font-size:18px; font-weight: bold"><a href="http://www.casamientoceciguille.com/#/confirmar/%number%">ACA</a></span>
            <br/>

            Les dejamos la tarjeta, esperamos que les guste y puedan acompa&ntilde;arnos el s&aacute;bado 23/04/2016 en El Solar.
            <br/>
            <img src='http://www.casamientoceciguille.com/images/invitacion3.jpg'/>
            <br/>
            <br/>
            P.D.: Si tienen problemas con los links pueden entrar a http://www.casamientoceciguille.com/ y confirmar con el siguiente n&uacute;mero: %number%
                       `
        );
        email.addSubstitution("%name%", guest.name);
        email.addSubstitution("%number%", guest.number);
        sendgrid.send(email, function (err, json) {
            if (err) {
                console.error(err);
            }
            else {
                console.log('enviado: ' + guest.name);
                db.collection('guests').updateOne({ _id: guest._id }, { $set: { sent: true } });
            }
        });


    });
    return;
});

