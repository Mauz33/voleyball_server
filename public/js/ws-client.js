document.addEventListener('DOMContentLoaded', () => {

    const socket = new WebSocket('ws://localhost:3000');
    const canvas = document.getElementById('gameCanvas');

    const { Render, World, Bodies, Engine, Body } = Matter;
// Создаем движок
    const engine = Engine.create();
// Создаем рендерер и привязываем его к <canvas>
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false,
            background: '#db7093' // Устанавливаем цвет фона
        }
    });

// Запускаем  рендер
    Render.run(render);




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


    const objects = {};
// Создаем объекты на клиенте
    function createObject(data) {
        const { id, position, type, width, height, isStatic } = data;
        if (type === 'rectangle'){
            console.log(scaleX)
            console.log(scaleY)
            // console.log(`Создаем прямоугольник: x=${position.x * scaleX}, y=${position.y * scaleY}, width=${width * scaleX}, height=${height * scaleY}`);
            let body = Bodies.rectangle(position.x * scaleX, position.y * scaleY, width * scaleX, height * scaleY, { isStatic: isStatic === true ? true : false});
            objects[id] = body;
            World.add(engine.world, body);
        }
    }
// Обновляем объекты на клиенте
    function updateObject(data) {
        const { id, position, type, width, height} = data;
        if (type === 'rectangle'){
            // console.log(`Обновляем прямоугольник: x=${position.x * scaleX}, y=${position.y * scaleY}, width=${width * scaleX}, height=${height * scaleY}`);
            const body = objects[id];
            const posConverted = {
                x: position.x * scaleX,
                y: position.y * scaleY
            }
            Body.setPosition(body, posConverted);

            // console.log(posConverted)

        }

    }
    function drawSimulation(state) {
        state.objects.forEach(obj => {
            if(!objects[obj.id]){
                createObject(obj);
            } else {
                updateObject(obj);
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
        // if(action && action !== 'jump')
    });
    function sendMovementCommands(){
        if(activeKeys.size === 0){
            socket.send("stop");
        }
        else
            activeKeys.forEach(action => socket.send(action))
    }
});





// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
//
