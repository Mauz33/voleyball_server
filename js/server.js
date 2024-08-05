const { SERVER_WIDTH, SERVER_HEIGHT } = require('./config');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();

const roomManager = require('./roomManager');

app.use(express.static('public'));
app.use(cors());

// Если вам нужно разрешить определенные домены, используйте объект настроек
const corsOptions = {
    origin: '*', // Замените на IP-адрес вашего сервера или оставьте '*', чтобы разрешить все
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

const server = http.createServer(app);
server.listen(3000, () => {
    console.log(`Сервер запущен на порту 3000. Размеры: ${SERVER_WIDTH}x${SERVER_HEIGHT}`);
});

app.use(express.json());

app.post('/rooms', (req, res) => {
    const {roomId, playerId} = roomManager.createRoom();
    res.status(201).send({ roomId: roomId, playerId: playerId });
});

module.exports = { server };
