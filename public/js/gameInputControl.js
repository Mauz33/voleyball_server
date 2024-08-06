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
const activeKeys = new Set();
const previousState = {};
document.addEventListener('keydown', (event) => {
    const action = keyMap[event.code];
    if (action && !previousState[event.code]) {
        // Только если клавиша не была ранее активна
        activeKeys.add(action);
        sendMovementCommand(action, 'keydown');
        previousState[event.code] = true;
    }
});

document.addEventListener('keyup', (event) => {
    const action = keyMap[event.code];
    if (action) {
        activeKeys.delete(action);
        sendMovementCommand(action, 'keyup');
        previousState[event.code] = false;
    }
});

function sendMovementCommand(action, eventType) {
    console.log(eventType); // Для отладки
    socket.send(JSON.stringify({ type: 'gameAction', action: action, eventType: eventType, roomId: roomId }));
}