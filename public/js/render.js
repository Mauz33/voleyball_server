const objects = {};

const canvas = document.getElementById('gameCanvas');

const { Render, Bodies, Body, Composite, Engine } = Matter;
const engine = Engine.create({ enableSleeping: false });
engine.world.gravity.y = 0;

// Создаем рендерер и привязываем его к <canvas>
const renderClient = Render.create({
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
Render.run(renderClient);

function createObject(data) {

    const { id, position, type, options, render } = data;
    if (type === 'Rectangle Body'){
        // console.log(`Создаем прямоугольник: x=${position.x * scaleX}, y=${position.y * scaleY}, width=${width * scaleX}, height=${height * scaleY}`);
        let body = Bodies.rectangle(position.x * scaleX, position.y * scaleY, options.width * scaleX, options.height * scaleY, options);
        objects[id] = body;
        body.render = render;
        Composite.add(renderClient.engine.world, body);
    }
    else if(type === 'Circle Body'){
        let body = Bodies.circle(position.x * scaleX, position.y * scaleY, options.radius * scaleX, options);
        objects[id] = body;
        body.render = render;
        Composite.add(renderClient.engine.world, body);
    }
    if (type === 'Polygon Body') {
        let body = Bodies.polygon(position.x * scaleX, position.y * scaleY, options.sides, options.radius * scaleX, options);
        objects[id] = body;
        body.render = render;
        Composite.add(renderClient.engine.world, body);
    }

}
// Обновляем объекты на клиенте
function updateObject(data) {
    const { id, position, angle, render} = data;
    const body = objects[id];
    const posConverted = {
        x: position.x * scaleX,
        y: position.y * scaleY
    }
    body.render = render;
    Body.setPosition(body, posConverted);
    Body.setAngle(body, angle);

}
function drawSimulation(state) {
    // console.log(state);
    state.forEach(obj => {
        if (!objects[obj.id]) {
            createObject(obj);
        }
        else {
            updateObject(obj);
        }
    });
}