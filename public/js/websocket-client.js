let socket;
let playerId;

function connectWebSocket(roomId){
    socket = new WebSocket('ws://192.168.0.112:3000');

    // Обработчик открытия соединения
    socket.addEventListener('open', () => {
        console.log('WebSocket соединение открыто');

        socket.send(JSON.stringify(
            {
                type: 'roomAction',
                action: 'join',
                roomId: roomId,
            })
        )
    });

    socket.addEventListener('message', (event) => {
        // Проверка типа данных
        if (typeof event.data === 'string') {
            try {
                const data = JSON.parse(event.data);
                // console.log('Получено состояние:', data); // Лог полученного состояния

                if (data.type === 'error') {
                    document.getElementById('responseMessage').textContent = 'Ошибка присоединения к комнате';
                    console.error('Error:', data.message);
                    socket.close()

                }
                else if(data.type === 'playerId'){
                    playerId = data.playerId;
                }
                else if (data.type === 'roomState') {
                    updateRoomState(data.players);
                }
                else if(data.type === 'gameState'){
                    // console.log('Получено состояние:', data); // Лог полученного состояния
                    drawSimulation(data.state);
                }
                else if(data.type === 'gameStarted'){
                    document.getElementById('overlay').style.display = 'none';
                }
            } catch (error) {
                console.error('Ошибка разбора JSON:', error);
            }
        } else {
            console.error('Получены неподдерживаемые данные:', event.data);
        }
    });
}