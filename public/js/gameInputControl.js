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
document.addEventListener('keydown', (event) => {
    const action = keyMap[event.code]
    if(action)
    {
        activeKeys.add(action);
        sendMovementCommands();
    }
});
document.addEventListener('keyup', (event) => {
    const action = keyMap[event.code]
    if(action){
        activeKeys.delete(action);
        sendMovementCommands();
    }
});
function sendMovementCommands(){
    console.log(playerId);
    if(activeKeys.size === 0){
        socket.send(JSON.stringify({type: 'gameAction', action: 'stop', roomId: roomId}));
    }
    else
        activeKeys.forEach(action => socket.send(JSON.stringify({type: 'gameAction', action: action, roomId: roomId})));
}