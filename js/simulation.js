const Matter = require('matter-js');
const {SERVER_WIDTH, SERVER_HEIGHT} = require("./config");
const {server} = require("./app");

const { Engine, Bodies, World } = Matter;

const engine = Engine.create();
const world = engine.world;

// Создаем тела для симуляции
const groundHeight = 200
const ground = Bodies.rectangle(SERVER_WIDTH/2, SERVER_HEIGHT - groundHeight / 2, SERVER_WIDTH, groundHeight, { isStatic: true, restitution: 0 });

const playerHeight = 400
const playerWidth = 400

const player = Bodies.rectangle(SERVER_WIDTH/2, 500, playerWidth, playerHeight, {
    mass: 80,
    inertia: Infinity,
    friction: 0.001, // Низкое значение сопротивления поверхности
    frictionAir: 0.01 // Низкое значение сопротивления воздуха
});

const ballRadius = 100
const ball = Bodies.circle(SERVER_WIDTH/2, 100, ballRadius);

World.add(world, [ground, ball, player]);

// Обновление состояния физической симуляции
function updateSimulation() {
    Engine.update(engine, 1000 / 60); // Обновляем каждую 1/60 секунды
}

function getSimulationState() {
    return {
        objects: [
            {
                type: 'circle',
                x: ball.position.x,
                y: ball.position.y,
                radius: ballRadius
            },
            {
                type: 'rectangle',
                x: ground.position.x,
                y: ground.position.y,
                width: SERVER_WIDTH,
                height: groundHeight
            },
            {
                type: 'rectangle',
                x: player.position.x,
                y: player.position.y,
                width: playerWidth,
                height: playerHeight
            }
        ]
    };
}

function applyForce(action){
    const moveSpeed = 10;
    const jumpSpeed = 20;
    switch (action) {
        case 'jump':
            // Matter.Body.applyForce(player, player.position, {x:0, y: -forceMagnitude})
            Matter.Body.setVelocity(player, {x: player.velocity.x, y: -jumpSpeed});
            break;
        case 'moveRight':
            // Matter.Body.applyForce(player, player.position, {x: forceMagnitude, y: 0})
            Matter.Body.setVelocity(player, {x: moveSpeed, y: player.velocity.y});
            break;
        case 'moveLeft':
            // Matter.Body.applyForce(player, player.position, {x: -forceMagnitude, y: 0})
            Matter.Body.setVelocity(player, {x: -moveSpeed, y: player.velocity.y});

            break;
        case 'moveDown':
            // Matter.Body.applyForce(player, player.position, {x: 0, y: forceMagnitude})
            Matter.Body.setVelocity(player, {x: player.velocity.x, y: jumpSpeed});
            break;
        default:
            alert( "Нет таких значений" );
    }
}

module.exports = {updateSimulation, getSimulationState, applyForce};