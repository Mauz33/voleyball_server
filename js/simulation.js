const Matter = require('matter-js');
const {SERVER_WIDTH, SERVER_HEIGHT} = require("./config");
const {server} = require("./app");

const { Engine, Bodies, World } = Matter;

const engine = Engine.create();
const world = engine.world;

engine.world.gravity.y = 3

// Создаем тела для симуляции
const groundHeight = 200
const wallWidth = 100

const ground = Bodies.rectangle(SERVER_WIDTH/2, SERVER_HEIGHT - groundHeight / 2, SERVER_WIDTH, groundHeight, { isStatic: true, restitution: 0 });
const leftWall = Bodies.rectangle(0 + wallWidth/2, SERVER_HEIGHT/2, wallWidth, SERVER_HEIGHT, { isStatic: true, restitution: 0 });
const rightWall = Bodies.rectangle(SERVER_WIDTH - wallWidth/2, SERVER_HEIGHT/2, wallWidth, SERVER_HEIGHT, { isStatic: true, restitution: 0 });
const roof = Bodies.rectangle(SERVER_WIDTH/2, 0 + wallWidth / 2, SERVER_WIDTH, wallWidth, { isStatic: true, restitution: 0 });

const playerHeight = 400
const playerWidth = 400

const player = Bodies.rectangle(SERVER_WIDTH/2, 500, playerWidth, playerHeight, {
    mass: 80,
    inertia: Infinity,
    friction: 0.0001, // Низкое значение сопротивления поверхности
    frictionAir: 0.001 // Низкое значение сопротивления воздуха
});

const ballRadius = 100
const ball = Bodies.circle(SERVER_WIDTH/2, 100, ballRadius, {
    restitution: 0.8,
    mass: 0.05,
});

World.add(world, [ground, roof, leftWall, rightWall, ball, player]);

// Обновление состояния физической симуляции
function updateSimulation() {
    Engine.update(engine, 1000 / 60); // Обновляем каждую 1/60 секунды
}

function getSimulationState() {
    return {
        objects: [
            // {
            //     id: ball.id,
            //     position: {
            //         x: ball.position.x,
            //         y: ball.position.y,
            //     },
            //     type: 'circle',
            //
            //     radius: ballRadius
            // },
            {
                id: ground.id,
                type: 'rectangle',
                position: {
                    x: ground.position.x,
                    y: ground.position.y,
                },
                width: SERVER_WIDTH,
                height: groundHeight,
                isStatic: true
            },
            // {
            //     id: leftWall.id,
            //     type: 'rectangle',
            //     position: {
            //         x: leftWall.position.x,
            //         y: leftWall.position.y,
            //     },
            //     width: wallWidth,
            //     height: SERVER_HEIGHT
            // },
            // {
            //     id: rightWall.id,
            //     type: 'rectangle',
            //     position: {
            //         x: rightWall.position.x,
            //         y: rightWall.position.y,
            //     },
            //     width: wallWidth,
            //     height: SERVER_HEIGHT
            // },
            // {
            //     id: roof.id,
            //     type: 'rectangle',
            //     position: {
            //         x: roof.position.x,
            //         y: roof.position.y,
            //     },
            //     width: SERVER_WIDTH,
            //     height: wallWidth
            // },
            {
                id: player.id,
                type: 'rectangle',
                position: {
                    x: player.position.x,
                    y: player.position.y,
                },
                width: playerWidth,
                height: playerHeight
            }
        ]
    };
}

function applyForce(action){
    const moveSpeed = 10;
    const jumpSpeed = 30;
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

        case 'stop':
            // Matter.Body.applyForce(player, player.position, {x: 0, y: forceMagnitude})
            Matter.Body.setVelocity(player, {x: 0, y: player.velocity.y});
            break;
        default:
            alert( "Нет таких значений" );
    }
}

module.exports = {updateSimulation, getSimulationState, applyForce};