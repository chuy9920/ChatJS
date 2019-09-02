const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const path = require('path');

const mogoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

mogoose.connect('mongodb+srv://chuy99:postgres@cluster0-2yw28.mongodb.net/test?retryWrites=true&w=majority')
    .then(db => console.log('db is connected'))
    .catch(err => console.log(err));

//settings
app.set('port', process.env.PORT || 3000)

// static files
app.use(express.static(path.join(__dirname, 'public')));

require('./sockets')(io);

//starting server
server.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
});