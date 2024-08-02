const { SERVER_WIDTH, SERVER_HEIGHT } = require('./config');
const express = require('express');
const http = require('http');
const app = express();

app.use(express.static('public'));

const server = http.createServer(app);

server.listen(3000, () => {
    console.log(`Сервер запущен на порту 3000. Размеры: ${SERVER_WIDTH}x${SERVER_HEIGHT}`);
});

module.exports = { server };
