const _ = require('lodash');
const moment = require('moment');

const { validateString } = require('./utils/validation.js');
const { users } = require('./data/users.js');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client conected to server`);

        socket.on('join', (joinData, fail) => {
            console.log(`user joined to server from client`, joinData, fail);

            const isValidName = validateString(joinData.name);
            const isValidRoom = validateString(joinData.room);

            if (!isValidName && !isValidRoom) {
                return fail({
                    type: 'InputError',
                    message: 'Please enter a Display Name and Room Name to join!'
                });
            } else if (!isValidName) {
                return fail({
                    type: 'InputError',
                    message: 'Please enter a Display Name to join!'
                });
            } else if (!isValidRoom) {
                return fail({
                    type: 'InputError',
                    message: 'Please enter a Room Name to join!'
                });
            }

            const maxUserCount = 2;
            const userCountByRoom = users.getUserCountByRoom(joinData.room);
            if (userCountByRoom === maxUserCount) {
                return fail({
                    type: 'MaxUserReached',
                    message: `There are already ${maxUserCount} players in room: ${joinData.room}. Please join another room.`
                });
            }

            socket.join(joinData.room);

            users.addUser(socket.id, joinData.name, joinData.room);
            io.to(joinData.room).emit('updateUsers', users.list.filter(u => u.room === joinData.room));

            socket.emit('receiveMessage', {
                type: 'system',
                text: `Welcome, ${joinData.name}.`
            });
            socket.broadcast.to(joinData.room).emit('receiveMessage', {
                type: 'system',
                text: `${joinData.name} joined.`
            });

            socket.on('sendMessage', (data, done) => {
                console.log(`sendMessage with ${JSON.stringify(data)}`);
                const isValid = validateString(data.text);
                if (!isValid) {
                    // return fail({
                    //     type: 'InputError',
                    //     message: 'Please type something before sending!'
                    // });
                    return;
                }
                done();

                const createdOn = moment().format();

                socket.emit('receiveMessage', {
                    type: 'self',
                    from: data.from,
                    text: data.text,
                    createdOn
                });
                socket.broadcast.to(joinData.room).emit('receiveMessage', {
                    type: 'user',
                    from: data.from,
                    text: data.text,
                    createdOn
                });
            });

            socket.on('sendLocation', (data, done, fail) => {
                console.log(`sendLocation with ${JSON.stringify(data)}`);

                const createdOn = moment().format();
                const currentLocationURL = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

                socket.emit('receiveLocation', {
                    type: 'self',
                    from: data.from,
                    url: currentLocationURL,
                    createdOn
                });
                socket.broadcast.to(joinData.room).emit('receiveLocation', {
                    type: 'user',
                    from: data.from,
                    url: currentLocationURL,
                    createdOn
                });
                done();
            });
        });

        socket.on('disconnect', () => {
            console.log(`${socket.id} left!!!!!!!!!!!!!!!!!!!!!!`);
            const user = users.removeUser(socket.id);
            if (_.isString(user)) {
                console.log(user);
                return;
            }
            io.to(user.room).emit('updateUsers', users.list.filter(u => u.room === user.room));
            io.to(user.room).emit('receiveMessage', {
                type: 'system',
                text: `${user.name} left.`
            });
        });
    });
};