const Database = require('./database');
const Helper = require('./helper');

class WebsocketHandler
{
	static id = 0;
	static clients = {};
	static DB = new Database();
	static baseMessage = {
		type: '',
	};

	static async broadcastToRoom(roomID, message) {
		let socketIDs = await WebsocketHandler.DB.getClientsInRoom(roomID)
		let clients = WebsocketHandler.clients
		socketIDs.forEach(function(client) {
			clients[client.socket_id].send(message);
		});
	}

	static async broadcastToClient(socketID = false, message, name = "", roomID = '') {
		if(socketID !== false) {
			WebsocketHandler.clients[socketID].send(message);
		} else {
			let socket = await WebsocketHandler.DB.getClientSocket(roomID, name);
			WebsocketHandler.clients[socket[0].socket_id].send(message);
		}
	}

	static async setupNewClient(client, roomID) {
		let clients = await WebsocketHandler.DB.getClientsInRoom(roomID)
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "setup";
		msg.totalClients = clients.length;
		msg.clients = Helper.getClientsWithStatusAndAvatar(clients);
		let message = JSON.stringify(msg);
		await WebsocketHandler.broadcastToClient(client.socket_id, message);
	}

	static async newClientJoined(client, roomID) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "client joined";
		msg.clientName = client.name;
		msg.clientAvatar = client.avatar;
		let message = JSON.stringify(msg);
		await WebsocketHandler.broadcastToRoom(roomID, message);
	}

	static async clientNameAlreadyTaken(client) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "username taken";
		let message = JSON.stringify(msg);
		await WebsocketHandler.broadcastToClient(client.socket_id, message);
	}

	static async clientLeft(client, roomID) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "client left";
		msg.clientName = client.name;
		let message = JSON.stringify(msg);
		await WebsocketHandler.broadcastToRoom(roomID, message);
	}

	static async clientReady(clientName, roomID) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "client ready";
		msg.clientName = clientName;

		let message = JSON.stringify(msg);

		await WebsocketHandler.broadcastToRoom(roomID, message);
	}

	static async clientNotReady(clientName, roomID) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "client unready";
		msg.clientName = clientName;

		let message = JSON.stringify(msg);

		await WebsocketHandler.broadcastToRoom(roomID, message);
	}

	static async allClientsReady(roomID) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "all clients ready";

		let message = JSON.stringify(msg);

		await WebsocketHandler.broadcastToRoom(roomID, message);
	}

	static async hostRequestResponse(client, success) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "host request";
		msg.success = success;

		let message = JSON.stringify(msg);
		await WebsocketHandler.broadcastToClient(client.socket_id, message);
	}

	static async startGame(roomID) {
		let msg = Object.create(WebsocketHandler.baseMessage);
		msg.type = "start game";

		let message = JSON.stringify(msg);
		await WebsocketHandler.broadcastToRoom(roomID, message);
	}
}

module.exports = WebsocketHandler;