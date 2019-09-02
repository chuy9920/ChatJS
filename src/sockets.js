const Chat = require('./models/Chat')
module.exports = function(io) {

    let users = {};

    io.on('connection', async socket => {
        console.log('Nuevo usuario conectado');

        let messages = await Chat.find({});
        socket.emit('load old msgs', messages);

        socket.on('new user', (data, cb) => {
            console.log(data);
            if (data in users){
                cb(false);
            } else {
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames()
            }
        })

        socket.on('send message', async (data, cb) => {

            var msg = data.trim();
            // console.log(msg.trim());
            if(msg.substr(0, 2) === '/w') {
            // console.log(msg.substr(0, 2));
                msg = msg.substr(3);
                const index = msg.indexOf(' ');
                if (index !== -1) {
                    var name = msg.substr(0, index);
                    var msg = msg.substr(index + 1);
                    // console.log('El mensaje es ' + msg);
                    if (name in users) {
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    } else {
                        cb('Error! Ingresa un usuario válido')
                    }
                } else {
                    cb('Error, por favor ingresa tu mensaje');
                }
            }else {
                var newMsg = new Chat({
                    msg,
                    nick: socket.nickname
                });

                await newMsg.save();

                io.sockets.emit('new message', {
                    msg: data,
                    nick: socket.nickname
                });
            }
        });

        socket.on('disconnect', data => {
            if (!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames()
        });

        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
}