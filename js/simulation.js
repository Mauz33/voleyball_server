const Matter = require('matter-js');
const {SERVER_WIDTH, SERVER_HEIGHT} = require("./config");
const {server} = require("./app");

const { Engine, Bodies, World, Body, Events } = Matter;

const engine = Engine.create();
const world = engine.world;

engine.world.gravity.y = 1;

const groundHeight = 200;
const wallWidth = 100;

const wallOptions = { isStatic: true, restitution: 0.2, friction: 0.1 };
const ground = Bodies.rectangle(SERVER_WIDTH / 2, SERVER_HEIGHT - groundHeight / 2, SERVER_WIDTH, groundHeight, wallOptions);
ground.options = { width: SERVER_WIDTH, height: groundHeight, ...wallOptions };

const leftWall = Bodies.rectangle(0 + wallWidth / 2, SERVER_HEIGHT / 2, wallWidth, SERVER_HEIGHT, wallOptions);
leftWall.options = { width: wallWidth, height: SERVER_HEIGHT, ...wallOptions };

const rightWall = Bodies.rectangle(SERVER_WIDTH - wallWidth / 2, SERVER_HEIGHT / 2, wallWidth, SERVER_HEIGHT, wallOptions);
rightWall.options = { width: wallWidth, height: SERVER_HEIGHT, ...wallOptions };

const roof = Bodies.rectangle(SERVER_WIDTH / 2, 0 + wallWidth / 2, SERVER_WIDTH, wallWidth, wallOptions);
roof.options = { width: SERVER_WIDTH, height: wallWidth, ...wallOptions };

const playerOptions = {
    mass: 80,
    inertia: Infinity,
    friction: 0,
    frictionAir: 0.005,
    restitution: 0
};

const player = Bodies.polygon(SERVER_WIDTH / 2, SERVER_HEIGHT / 2, 6, 160, playerOptions);
player.options = {sides: 6, radius:160, ...playerOptions };
// Поворачиваем шестиугольник на 90 градусов (π/2 радиан)
// Body.rotate(player, Math.PI / 2);

const ballOptions = {
    restitution: 0.7,
    mass: 5,
    friction: 0.0001, // Увеличиваем трение для лучшего взаимодействия
    frictionAir: 0.008
};
const ball = Bodies.circle(SERVER_WIDTH / 2, 100, 150, ballOptions);
ball.options = { radius: 150, ...ballOptions };

World.add(world, [ground, roof, leftWall, rightWall, ball, player]);

// // Обработка столкновений
// Events.on(engine, 'collisionStart', (event) => {
//     const pairs = event.pairs;
//     for (let i = 0; i < pairs.length; i++) {
//         const pair = pairs[i];
//         if ((pair.bodyA === player && pair.bodyB === ball) || (pair.bodyA === ball && pair.bodyB === player)) {
//             // Если игрок находится на мяче, обнуляем вертикальную скорость игрока и мяча
//             if (player.position.y < ball.position.y) {
//                 Body.setVelocity(player, { x: player.velocity.x, y: 0 });
//                 Body.setVelocity(ball, { x: ball.velocity.x, y: 0 });
//             }
//         }
//     }
// });

// Обновление состояния физической симуляции
function updateSimulation() {
    // const maxSpeed = 10;
    // [player, ball].forEach(body => {
    //     if (Math.abs(body.velocity.x) > maxSpeed) {
    //         Body.setVelocity(body, { x: Math.sign(body.velocity.x) * maxSpeed, y: body.velocity.y });
    //     }
    //     if (Math.abs(body.velocity.y) > maxSpeed) {
    //         Body.setVelocity(body, { x: body.velocity.x, y: Math.sign(body.velocity.y) * maxSpeed });
    //     }
    // });

    Engine.update(engine, 1000 / 60); // Обновляем каждую 1/60 секунды

}

function getSimulationState() {
    console.log(player.label);
    const bodies = engine.world.bodies.map(body => ({
        id: body.id,
        type: body.label,
        position: body.position,
        angle: body.angle,
        options: body.options
    }));

    return bodies;
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

        case 'stop':
            // Matter.Body.applyForce(player, player.position, {x: 0, y: forceMagnitude})
            Matter.Body.setVelocity(player, {x: 0, y: player.velocity.y});
            break;
        default:
            alert( "Нет таких значений" );
    }
}

module.exports = {updateSimulation, getSimulationState, applyForce};