const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const roomManager = require('./roomManager')

const SimulationManager = require('./SimulationManager');
const {json} = require("express");

function setupWebSocket(server) {

    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Новое WebSocket подключение');

        const playerId = uuidv4();
        ws.playerId = playerId; // Сохраняем playerId в объекте WebSocket

        ws.send(JSON.stringify({type: 'playerId', playerId}));

        ws.on('message', (data) => {
            console.log('received: %s', data);

            const textDecoder = new TextDecoder('utf-8');
            const message = JSON.parse(textDecoder.decode(data));

            if(message.type === 'roomAction'){
                switch (message.action){
                    case 'join':
                        handleJoinRoom(ws, message.roomId, playerId);
                        break;
                    case 'startGame':
                        roomManager.startSimulation(message.roomId);

                        break;
                    case 'selectCommand':
                        roomManager.selectSide(message.roomId, ws.playerId, message.side)
                }
            }
            else if(message.type === 'gameAction'){
                roomManager.handleGameAction(message.roomId, ws.playerId, message.action, message.eventType);

            }
        });

        ws.on('close', () => {
            const roomId = roomManager.removeFromRoom(ws.playerId)
            broadcastRoomState(roomId);
            console.log('Клиент отключился');
        });
    });
}


function handleJoinRoom(ws, roomId, playerId) {
    const room = roomManager.getRoom(roomId);
    if(room){
        roomManager.joinRoom(roomId, { playerId: playerId, ws });
        broadcastRoomState(roomId);
    }
    else{
        ws.send(JSON.stringify({type: 'error', message: 'Комнаты не существует'}))
    }

}

// Функция для отправки обновления состояния комнаты всем клиентам
function broadcastRoomState(roomId) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const state = {
        type: 'roomState',
        players: room.players.map(player => ({ playerId: player.playerId }))
    };

    room.players.forEach(player => {
        if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(state));
        }
    });
}



// /// Что не относится к непосдретвенному созданию сокетов
// const simulationManager = new SimulationManager();
// let players = []
//
// const player = players.length === 0 ? simulationManager.playerLeft : simulationManager.playerRight;
// players.push({ ws, player });
//
//
//
//
// const interval = setInterval(() => {
//     simulationManager.update();
//     const state = simulationManager.getSimulationState();
//     // console.log('Отправка состояния:', state); // Добавляем лог перед отправкой
//     ws.send(JSON.stringify(state));
// }, 1000 / 120); // 60 FPS
//
//
//
// clearInterval(interval);
// players = players.filter(p => p.ws !== ws); // Удалить игрока при отключении

module.exports = setupWebSocket;
