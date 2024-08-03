

const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const SimulationManager = require('./simulationManager');
class RoomManager{
    constructor() {
        this.rooms = {};
    }
    createRoom(){
        const roomId = uuidv4();
        this.rooms[roomId] = {
            id: roomId,
            players: [],
            simulation: new SimulationManager(),
            isGameStarted: false,
        }
        // console.log(`Room ${roomId} created`);
        return {
            roomId: roomId,
        };
    }
    joinRoom(roomId, player){
        const room = this.rooms[roomId];
        if(room)
            room.players.push(player)

        // Назначаем playerId объекту игрока в симуляции
        if (room.players.length === 0) {
            room.simulation.playerLeft.playerId = player.id;
        } else if (room.players.length === 1) {
            room.simulation.playerRight.playerId = player.id;
        }

        return player.id;
    }
    getRoom(roomId) {
        return this.rooms[roomId];
    }

    handleGameAction(roomId, playerId, action) {
        console.log(playerId);
        const room = this.rooms[roomId];
        // console.log(room, playerId);
        room.simulation.applyForce(playerId, action);
    }
    startSimulation(roomId) {
        const room = this.rooms[roomId];

        if (room && !room.isGameStarted) {
            room.isGameStarted = true
            this.broadcast(roomId); // Рассылаем обновленное состояние игрокам
            setInterval(() => {
                room.simulation.update(); // Обновляем симуляцию
                this.broadcastState(roomId); // Рассылаем обновленное состояние игрокам
            }, 1000 / 120); // 60 FPS
        }
    }

    broadcast(roomId) {
        const room = this.rooms[roomId];
        if (room) {
            room.players.forEach(player => {
                if (player.ws && player.ws.readyState === WebSocket.OPEN) {
                    player.ws.send(JSON.stringify({ type: 'gameStarted' }));
                }
            });
        }
    }

    broadcastState(roomId) {
        const room = this.rooms[roomId];
        if (room) {
            const state = room.simulation.getSimulationState();
            room.players.forEach(player => {
                if (player.ws && player.ws.readyState === WebSocket.OPEN) {
                    player.ws.send(JSON.stringify({ type: 'gameState', state }));
                }
            });
        }
    }

}

module.exports = new RoomManager();