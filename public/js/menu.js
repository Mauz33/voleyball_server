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
            document.getElementById('teamSelection').style.display = 'block';

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
    document.getElementById('teamSelection').style.display = 'block';

});

document.getElementById('startGame').addEventListener('click', function(event) {
    event.preventDefault(); // Предотвратить перезагрузку страницы

    socket.send(JSON.stringify({type: 'roomAction', action: 'startGame', roomId: roomId }));
});


function selectSide(side){
    socket.send(JSON.stringify({type: 'roomAction', action: 'selectCommand', roomId: roomId, side: side}));

}

function showScore(){
    document.getElementById('score-bar').style.display = 'flex';
}

function updateScore(score){
    document.getElementById('score').textContent = `${score.left}-${score.right}`;
}

function updateRoomState(players){
    const playersList = document.getElementById(`participants`);
    playersList.innerHTML = '';

    players.forEach((player, index) =>{
        const li = document.createElement('li');
        if(player.playerId === playerId)
            li.className = 'list-group-item list-group-item-dark';
        else
            li.className = 'list-group-item';

        li.textContent = `Игрок ${index + 1}: ${player.playerId}`;
        playersList.appendChild(li);
    })

    if(players.length > 0)
        document.getElementById('startGame').style.display = 'block';
}

function updateTeamList(players) {
    const left = document.getElementById(`team-left-list`);
    const right = document.getElementById(`team-right-list`);
    left.innerHTML = ''; // Очистка текущего списка
    right.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.playerId;
        if(player.side === 'left'){
            li.className = 'list-group-item list-group-item-danger';
            left.appendChild(li);
        }
        else if(player.side === 'right'){
            li.className = 'list-group-item list-group-item-primary';
            right.appendChild(li);
        }
    });
}