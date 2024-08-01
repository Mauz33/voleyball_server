const Matter = require('matter-js');
const {SERVER_WIDTH, SERVER_HEIGHT} = require("./config");
const {server} = require("./app");

const { Engine, Bodies, World, Body, Constraint, Composites, Events } = Matter;

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

const player = Bodies.polygon(SERVER_WIDTH / 3, SERVER_HEIGHT / 2, 10, 160, playerOptions);
player.options = {sides: 10, radius:160, ...playerOptions };
// Поворачиваем шестиугольник на 90 градусов (π/2 радиан)
Body.rotate(player, Math.PI / 2);


const group = Body.nextGroup(true);
const chainElementWidth = 20;
const chainElementHeight = 50;

const ropeX = SERVER_WIDTH/2;

const yTop = SERVER_HEIGHT - SERVER_HEIGHT/2;
const yBottom = SERVER_HEIGHT - ground.options.height - player.options.radius;

const ropeY = yTop;

const chainLength = -Math.round((yTop - yBottom) / chainElementHeight);

console.log(chainLength);

const rope = Composites.stack(ropeX, ropeY, 1, chainLength, 0, 0, function (x,y){
    const bodyOptions = {
        render: {
            fillStyle: 'transparent',
            strokeStyle: 'white',
            lineWidth: 3
        },
        collisionFilter: {group: group},
        chamfer: 0
    }
    const body = Bodies.rectangle(x, y, chainElementWidth, chainElementHeight, bodyOptions);
    body.options = { width: chainElementWidth, height: chainElementHeight, ...bodyOptions };
    return body;
});

Composites.chain(rope, 0, 0.5, 0, -0.5, {stiffness:1, length: 0});

const topConstraint = Constraint.create({
    pointA: {x: ropeX, y: yTop-100},
    bodyB: rope.bodies[0],
    pointB: {x:0, y: -chainElementHeight/2},
    stiffness: 0.08,
    length: 10
})

const bottomConstraint = Constraint.create({
    pointA: {x: ropeX, y: yBottom},
    bodyB: rope.bodies[rope.bodies.length - 1],
    pointB: {x:0, y: chainElementHeight/2},
    stiffness: 0.9,
    length: 0
})

World.add(world, [rope, topConstraint, bottomConstraint]);

const ballOptions = {
    restitution: 0.7,
    mass: 5,
    friction: 0.0001, // Увеличиваем трение для лучшего взаимодействия
    frictionAir: 0.008
};
const ball = Bodies.circle(SERVER_WIDTH / 3, 100, 150, ballOptions);
ball.options = { radius: 150, ...ballOptions };



const colorA = 'green',
    colorB = 'blue';

const colliderOptions = {
    isSensor: true,
    isStatic: true,
    render: {
        fillStyle: colorB,
        lineWidth: 1
    }
};

const collider = Bodies.rectangle(SERVER_WIDTH/4, SERVER_HEIGHT - groundHeight, SERVER_WIDTH/2, 10, colliderOptions);
collider.options = { width: SERVER_WIDTH/2, height: 10, ...colliderOptions};

Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;

    for (let i = 0, j = pairs.length; i !== j; ++i) {
        const pair = pairs[i];

        if (pair.bodyA.id === collider.id && pair.bodyB.id === ball.id) {
            pair.bodyB.render.fillStyle = colorA;
            console.log(pair.bodyB.render);
            break;
        } else if (pair.bodyB.id === collider.id && pair.bodyA.id === ball.id) {
            pair.bodyA.render.fillStyle = colorA;
            console.log(pair.bodyA.render);

            break;

        }
    }


});



World.add(world, [ground, roof, leftWall, rightWall, ball, player, collider]);


// Обновление состояния физической симуляции
function updateSimulation() {
    Engine.update(engine, 1000 / 60); // Обновляем каждую 1/60 секунды
}

function getSimulationState() {
    const bodies = engine.world.bodies.map(body => ({
        id: body.id,
        type: body.label,
        position: body.position,
        angle: body.angle,
        options: body.options,
        render: body.render
    }));

    const ropeBodies = rope.bodies.map(body => ({
        id: body.id,
        type: body.label,
        position: body.position,
        angle: body.angle,
        options: body.options,
        render: body.render
    }));

    return bodies.concat(ropeBodies);
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

function applyStartPosition(){

}

module.exports = {updateSimulation, getSimulationState, applyForce};