// Создание WebSocket подключения
const socket = new WebSocket('ws://localhost:3000');
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Обработчик открытия соединения
socket.addEventListener('open', () => {
    console.log('WebSocket соединение открыто');
});

socket.addEventListener('message', (event) => {
    // Проверка типа данных
    if (typeof event.data === 'string') {
        try {
            const state = JSON.parse(event.data);
            // console.log('Получено состояние:', state); // Лог полученного состояния
            drawSimulation(state);
        } catch (error) {
            console.error('Ошибка разбора JSON:', error);
        }
    } else {
        console.error('Получены неподдерживаемые данные:', event.data);
    }
});

function drawSimulation(state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    state.objects.forEach(obj => {
        if (obj.type === 'circle') {
            // console.log(`Рисуем круг: x=${obj.x * scaleX}, y=${obj.y * scaleY}, radius=${obj.radius}`);
            context.beginPath();
            context.arc(obj.x * scaleX, obj.y * scaleY, obj.radius * scaleX, 0, 2 * Math.PI); // Применяем масштабирование
            context.fillStyle = 'blue';
            context.fill();
        } else if (obj.type === 'rectangle') {
            // console.log(`Рисуем прямоугольник: x=${obj.x}, y=${obj.y}, width=${obj.width}, height=${obj.height}`);
            context.fillStyle = 'red';
            context.fillRect(
                (obj.x - obj.width / 2) * scaleX,
                (obj.y - obj.height / 2) * scaleY,
                obj.width * scaleX,
                obj.height * scaleY
            ); // Применяем масштабирование
        }
    });
}

const keyMap = {
    KeyW: 'jump',
    ArrowUp: 'jump',
    Space: 'jump',
    ArrowLeft: 'moveLeft',
    KeyA: 'moveLeft',
    ArrowRight: 'moveRight',
    KeyD: 'moveRight',
    ArrowDown: 'moveDown',
    KeyS: 'moveDown'
};

document.addEventListener('keydown', (event) => {
    const action = keyMap[event.code]
    if(action)
        socket.send(action);
});
