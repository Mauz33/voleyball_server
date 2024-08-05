let roomId;

document.getElementById('createRoomForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвратить перезагрузку страницы

    fetch('http://192.168.0.112:3000/rooms', {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            connectWebSocket(data.roomId)
            roomId = data.roomId;
            document.getElementById('responseMessage').textContent = `Комната создана с ID: ${data.roomId}`;

            document.getElementById('joinRoomForm').style.display = 'none';
            document.getElementById('createRoomForm').style.display = 'none';
            document.getElementById('roomState').style.display = 'block';

        })
        .catch(error => {
            document.getElementById('responseMessage').textContent = 'Ошибка создания комнаты';
            console.error('Error:', error);
        });
});

document.getElementById('joinRoomForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвратить перезагрузку страницы

    // Получение данных из инпута
    const roomInputValue = document.getElementById('roomId').value;

    connectWebSocket(roomInputValue);
    roomId = roomInputValue;

    document.getElementById('joinRoomForm').style.display = 'none';
    document.getElementById('createRoomForm').style.display = 'none';
    document.getElementById('roomState').style.display = 'block';
});

document.getElementById('startGame').addEventListener('click', function(event) {
    event.preventDefault(); // Предотвратить перезагрузку страницы

    socket.send(JSON.stringify({type: 'roomAction', action: 'startGame', roomId: roomId }));
});

function updateRoomState(players){
    players.forEach((player, index) =>{
        const playerSlot = document.getElementById(`player${index}`).textContent = `Игрок ${index + 1}: ${player.id}`;
    })

    if(players.length > 0)
        document.getElementById('startGame').style.display = 'block';
}