const { Engine, Bodies, World, Body, Constraint, Composites, Events } = require("matter-js");
const {SERVER_WIDTH, SERVER_HEIGHT} = require("./config");
const Matter = require("matter-js");

class SimulationManager{
    constructor() {
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.objects = [];
        this.ground = null;
        this.playerLeft = null;
        this.playerRight = null;
        this.#setupSimulation();
    }
    #setupSimulation() {
        this.#createBoundaries();
        this.#createBall();
        this.#createPlayers();
        this.#createNet();
    }
    #createBoundaries() {
        // Создание границ и добавление их в мир
        const groundHeight = 200;
        const wallWidth = 100;

        const wallOptions = { isStatic: true, restitution: 0.2, friction: 0.1 };
        const ground = Bodies.rectangle(SERVER_WIDTH / 2, SERVER_HEIGHT - groundHeight / 2, SERVER_WIDTH, groundHeight, wallOptions);
        ground.options = { width: SERVER_WIDTH, height: groundHeight, ...wallOptions };
        this.ground = ground;

        const leftWall = Bodies.rectangle(0 + wallWidth / 2, SERVER_HEIGHT / 2, wallWidth, SERVER_HEIGHT, wallOptions);
        leftWall.options = { width: wallWidth, height: SERVER_HEIGHT, ...wallOptions };

        const rightWall = Bodies.rectangle(SERVER_WIDTH - wallWidth / 2, SERVER_HEIGHT / 2, wallWidth, SERVER_HEIGHT, wallOptions);
        rightWall.options = { width: wallWidth, height: SERVER_HEIGHT, ...wallOptions };

        const roof = Bodies.rectangle(SERVER_WIDTH / 2, 0 + wallWidth / 2, SERVER_WIDTH, wallWidth, wallOptions);
        roof.options = { width: SERVER_WIDTH, height: wallWidth, ...wallOptions };

        const boundaries = [ground, leftWall, rightWall, roof]
        World.add(this.world, boundaries);
        Array.prototype.push.apply(this.objects, boundaries);

    }

    #createBall() {
        const ballOptions = {
            restitution: 0.7,
            mass: 5,
            friction: 0.0001, // Увеличиваем трение для лучшего взаимодействия
            frictionAir: 0.008
        };
        const ball = Bodies.circle(SERVER_WIDTH / 3, 100, 150, ballOptions);
        ball.options = { radius: 150, ...ballOptions };

        this.objects.push(ball);
        World.add(this.world, ball);
    }

    #createPlayers() {
        const playerOptions = {
            mass: 80,
            inertia: Infinity,
            friction: 0,
            frictionAir: 0.005,
            restitution: 0
        };

        const playerLeft = Bodies.polygon(SERVER_WIDTH / 3, SERVER_HEIGHT / 2, 10, 160, playerOptions);
        playerLeft.playerId = null;
        playerLeft.options = {sides: 10, radius:160, ...playerOptions };
        Body.rotate(playerLeft, Math.PI / 2);

        const playerRight = Bodies.polygon(SERVER_WIDTH - SERVER_WIDTH / 3, SERVER_HEIGHT / 2, 10, 160, {render: {fillStyle: 'white'}, ...playerOptions});
        playerRight.options = {sides: 10, radius:160, ...playerOptions }
        playerLeft.playerId = null;
        Body.rotate(playerRight, Math.PI / 2);

        // Поворачиваем шестиугольник на 90 градусов (π/2 радиан)

        this.objects.push(playerLeft, playerRight);
        World.add(this.world, [playerLeft, playerRight]);

        this.playerLeft = playerLeft;
        this.playerRight= playerRight;
    }

    #createNet() {
        // Создание сетки и добавление её в мир
        const group = Body.nextGroup(true);
        const chainElementWidth = 20;
        const chainElementHeight = 50;

        const ropeX = SERVER_WIDTH/2;

        const yTop = SERVER_HEIGHT - SERVER_HEIGHT/2;
        const yBottom = SERVER_HEIGHT - this.ground.options.height - 160;

        const ropeY = yTop;

        const chainLength = -Math.round((yTop - yBottom) / chainElementHeight);

        const rope = Composites.stack(ropeX, ropeY, 1, chainLength, 0, 0, (x,y) => {
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

            this.objects.push(body);
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

        World.add(this.world, [rope, topConstraint, bottomConstraint]);
    }

    update() {
        Engine.update(this.engine, 1000 / 60);
    }
    getSimulationState() {
        return this.objects.map(body =>
        {
            const obj = ({
                    id: body.id,
                    render: body.render,
                    type: body.label,
                    position: body.position,
                    angle: body.angle,
                    options: body.options
                }
            )
            // console.log(obj.render);
            return obj;
        });
    }
    applyForce(playerId, action){
        const moveSpeed = 10;
        const jumpSpeed = 20;
        let player = this.playerRight.playerId === playerId ? this.playerRight : this.playerLeft;

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
}

module.exports = SimulationManager;