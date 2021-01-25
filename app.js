const express = require('express');
const app = express();
const server = require('http').createServer(app);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server:server });

const Routes = require('./router');
app.use(Routes);

const Room = require('./room');

let id = 0;
let clients = {};

wss.on('connection', function connection(ws) {
	ws.id = id++;
	clients[ws.id] = ws;
	
	console.log('new client connected');
	ws.send('client successfully connected');

	ws.on('message', function incoming(msg) {
		message = JSON.parse(msg);
		(async() => {
			if (message.target === 'joinroom') {
				let room = await createRoom(message.roomid)
				await room.addNewClient();

				ws.send(message.name);
				ws.send(message.roomid);
			} else if (message.target === 'ready') {
				ws.send('client is ready');
			}
		})();
	});

	ws.on('close', function close() {
		(async() => {
			let room = await createRoom(message.roomid)
			console.log('connection closed');
			await room.RemoveClient();
			id--;
		})();
	});

	console.log('number of clients: ', id);
});

async function createRoom(roomID) {
	let room = new Room();
	await room.construct(roomID);
	return room;
}
server.listen(3000, () => console.log('listening on port 3000'));
