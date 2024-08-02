const WebSocket = require('ws');
const SimulationManager = require('./SimulationManager');

function setupWebSocket(server) {
    const simulationManager = new SimulationManager();

    const wss = new WebSocket.Server({ server });

    let players = []
    wss.on('connection', (ws) => {
        console.log('Новое WebSocket подключение');

        const player = players.length === 0 ? simulationManager.playerLeft : simulationManager.playerRight;
        players.push({ ws, player });

        const interval = setInterval(() => {
            simulationManager.update();
            const state = simulationManager.getSimulationState();
            // console.log('Отправка состояния:', state); // Добавляем лог перед отправкой
            ws.send(JSON.stringify(state));
        }, 1000 / 120); // 60 FPS

        ws.on('close', () => {
            clearInterval(interval);
            players = players.filter(p => p.ws !== ws); // Удалить игрока при отключении
            console.log('Клиент отключился');
        });

        ws.on('message', (data) => {
            console.log('received: %s', data);

            const textDecoder = new TextDecoder('utf-8');
            const message = textDecoder.decode(data);

            simulationManager.applyForce(player, message);
        });
    });
}

module.exports = setupWebSocket;
