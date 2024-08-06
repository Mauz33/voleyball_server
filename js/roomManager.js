const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const SimulationManager = require('./simulationManager');
const GameManager = require('./gameManager');
const removeElementById = require("./customTools");
const Matter = require("matter-js");

class RoomManager{
    constructor() {
        this.rooms = {};
        this.index = 0;


    }
    createRoom(){
        // const roomId = uuidv4();
        const roomId = this.index++;

        const simulation = new SimulationManager();
        this.rooms[roomId] = {
            id: roomId,
            players: [],
            simulation: simulation,
            gameManager: new GameManager(simulation, [], (score) => {
                this.onScoreChange(roomId, score)
            }),
            isGameStarted: false,
        }
        // console.log(`Room ${roomId} created`);
        return {
            roomId: roomId,
        };
    }

    onScoreChange(roomId, score) {
        // Обработка изменения счета
        console.log(`Score updated in room ${roomId}:`, score);
        // Отправка информации о счете через сокеты
        this.broadcast(roomId, { type: 'scoreUpdated', score: score });
    }

    joinRoom(roomId, player){
        const room = this.rooms[roomId];
        if(room){
            room.players.push(player)
            room.gameManager.players = room.players; // Обновляем список игроков в GameManager
        }

        return player.playerId;
    }

    removeFromRoom(playerId){
        const roomId = this.getRoomIdByPlayerId(playerId);
        const room = this.getRoom(roomId);
        if(room){
            removeElementById(room.players, playerId);

            const objectId = room.simulation.removePlayer(playerId)
            room.gameManager.players = room.players; // Обновляем список игроков в GameManager

            this.broadcast(roomId, {type: 'removeObject', id: objectId});
            console.log(`Object id ${objectId}`);
        }


        return roomId;
    }

    getRoomIdByPlayerId(playerId) {
        for (const [roomId, room] of Object.entries(this.rooms)) {
            for (const player of room.players) {
                if (player.playerId === playerId) {
                    return roomId; // Возвращаем roomId, если нашли нужного игрока
                }
            }
        }
        return null; // Возвращаем null, если игрок не найден
    }

    selectSide(roomId, playerId, side) {
        const room = this.rooms[roomId];
        if(room){
            let player = room.players.find(x => x.playerId === playerId);
            player.side = side

            this.broadcast(roomId, {type: 'commandSelected', side: side, players: room.players})
        }
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
            room.simulation.addPlayers(room.players);
            this.broadcast(roomId, { type: 'gameStarted' }); // Рассылаем обновленное состояние игрокам

            room.gameManager.restartRound();

            setInterval(() => {
                room.simulation.update(); // Обновляем симуляцию
                this.broadcastState(roomId); // Рассылаем обновленное состояние игрокам
            }, 1000 / 120); // 60 FPS
        }
    }

    broadcast(roomId, obj) {
        const room = this.rooms[roomId];
        if (room) {
            room.players.forEach(player => {
                if (player.ws && player.ws.readyState === WebSocket.OPEN) {
                    player.ws.send(JSON.stringify(obj));
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