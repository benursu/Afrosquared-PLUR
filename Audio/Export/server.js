const express = require('express'),
    fs = require('fs')
    url = require('url');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.post('/receiveNotes', function(request, respond) {
    var body = '';
    filePath = __dirname + '/public/notes.obj';
    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function (){
        fs.writeFile(filePath, body, function() {
            respond.end();
        });
    });
});

app.post('/receiveNotesParticles', function(request, respond) {
    var body = '';
    filePath = __dirname + '/public/notesParticles.dae';
    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function (){
        fs.writeFile(filePath, body, function() {
            respond.end();
        });
    });
});

app.listen(port, () => console.log(`P.L.U.R Midi Export Tool listening on port ${port}!`));