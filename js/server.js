const { SERVER_WIDTH, SERVER_HEIGHT } = require('./config');
const { app, server } = require('./app');
const wss = require('./websocket');

server.listen(3000, () => {
    console.log(`Сервер запущен на порту 3000. Размеры: ${SERVER_WIDTH}x${SERVER_HEIGHT}`);
});
