
const objects = {};

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const { Render, Bodies, Body, Composite, Engine, World } = Matter;
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
        body.id = id;
        Composite.add(renderClient.engine.world, body);
    }
    else if(type === 'Circle Body'){
        let body = Bodies.circle(position.x * scaleX, position.y * scaleY, options.radius * scaleX, options);
        objects[id] = body;
        body.render = render;
        body.id = id;
        Composite.add(renderClient.engine.world, body);
    }
    if (type === 'Polygon Body') {
        let body = Bodies.polygon(position.x * scaleX, position.y * scaleY, options.sides, options.radius * scaleX, options);
        objects[id] = body;
        body.render = render;
        body.id = id;
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
    state.forEach(obj => {
        if (!objects[obj.id]) {
            createObject(obj);
        }
        else {
            updateObject(obj);
        }
    });
}

function removeObjectFromWorld(objectId){
    const object = engine.world.bodies.find(x => x.id === objectId);
    World.remove(engine.world, object);
    removeElementById(this.objects, objectId);
}

function removeElementById(array, id) {
    const index = array.findIndex(item => item.id === id);
    console.log(index);
    if (index !== -1) {
        array.splice(index, 1);
    }
}