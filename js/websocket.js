const WebSocket = require('ws');
const { server } = require('./app');
const SimulationManager = require('./SimulationManager');
const simulationManager = new SimulationManager();

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Новое WebSocket подключение');

    const interval = setInterval(() => {
        simulationManager.update();
        const state = simulationManager.getSimulationState();
        // console.log('Отправка состояния:', state); // Добавляем лог перед отправкой
        ws.send(JSON.stringify(state));
    }, 1000 / 120); // 60 FPS

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Клиент отключился');
    });

    ws.on('message', (data) => {
        console.log('received: %s', data);

        const textDecoder = new TextDecoder('utf-8');
        const message = textDecoder.decode(data);

        simulationManager.applyForce(message);
    });
});

module.exports = wss;
