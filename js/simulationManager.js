const { Engine, Bodies, World, Body, Constraint, Composites, Events } = require("matter-js");
const {SERVER_WIDTH, SERVER_HEIGHT} = require("./config");
const Matter = require("matter-js");
const removeElementById = require("./customTools");


class SimulationManager{
    constructor() {
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.objects = [];
        this.ground = null;
        this.players = [];
        this.ball = null;
        this.goalZones = {};
        this.onBallCollideGround = null;
        this.#setupSimulation();
    }

    #setupSimulation() {
        this.#createBoundaries();
        this.#createBall();
        this.#createNet();
        this.#createGoalZones();

        Events.on(this.engine, 'collisionStart',  event => {
            event.pairs.forEach(pair => {

                if(this.#isCollision(pair, this.ball, this.goalZones.left)){
                    // this.goalZones.left.render.fillStyle = 'black';
                    this.#handleBallCollideGround('left');
                }

                if(this.#isCollision(pair, this.ball, this.goalZones.right)){
                    // this.goalZones.left.render.fillStyle = 'green';
                    this.#handleBallCollideGround('right');
                }

                this.players.forEach(player => {
                    if(this.#isCollision(pair, player, this.ground)){
                        player.jumpCount = 0;
                        this.canJump = true;
                    }
                })
            })

        })
    }

    #isCollision(pair, body1, body2){
        return ((pair.bodyA === body1 && pair.bodyB === body2) ||
            (pair.bodyA === body2 && pair.bodyB === body1));

    }

    #handleBallCollideGround(side){
        if(this.onBallCollideGround){
            this.onBallCollideGround(side);
        }
    }

    #createGoalZones() {
        const goalZoneLeftOptions = {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: 'white'
            }
        };
        const goalZoneLeft = Bodies.rectangle(SERVER_WIDTH / 4, SERVER_HEIGHT - 100, SERVER_WIDTH / 2, 200, goalZoneLeftOptions);
        goalZoneLeft.options = {width: SERVER_WIDTH / 2, height: 200, ...goalZoneLeftOptions}

        const goalZoneRightOptions = {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: 'blue'
            }
        };
        const goalZoneRight = Bodies.rectangle(SERVER_WIDTH - SERVER_WIDTH / 4, SERVER_HEIGHT - 100, SERVER_WIDTH / 2, 200, goalZoneRightOptions);
        goalZoneRight.options = {width: SERVER_WIDTH / 2, height: 200, ...goalZoneRightOptions};

        this.goalZones = {left: goalZoneLeft, right: goalZoneRight};
        World.add(this.world, [goalZoneLeft, goalZoneRight]);
        this.objects.push(goalZoneLeft, goalZoneRight);

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
        const defaultPosition = this.getBallDefaultPosition('left');
        const ball = Bodies.circle(defaultPosition.x, defaultPosition.y, 150, ballOptions);
        ball.options = { radius: 150, ...ballOptions };

        this.ball = ball;
        this.objects.push(ball);
        World.add(this.world, ball);
    }

    getBallDefaultPosition(side){
        if(side === 'left')
            return {x: SERVER_WIDTH / 5, y: SERVER_HEIGHT - 1000}
        else if (side === 'right')
            return {x: SERVER_WIDTH - SERVER_WIDTH / 5, y: SERVER_HEIGHT - 1000};
    }

    getPlayerDefaultPosition(side){
        if(side === 'left')
            return {x: SERVER_WIDTH / 8, y: SERVER_HEIGHT - 200 - 160}
        else if (side === 'right')
            return {x: SERVER_WIDTH - SERVER_WIDTH / 8, y: SERVER_HEIGHT - 200 - 160};
    }
    addPlayers(players) {
        const group = Body.nextGroup(true);

        const playerOptions = {
            mass: 180,
            inertia: Infinity,
            friction: 0,
            frictionAir: 0.005,
            restitution: 0,
            collisionFilter: {group: group},
        };

        players.forEach(p => {
            let player
            let defaultPosition;
            switch (p.side){
                case 'left':
                    defaultPosition = this.getPlayerDefaultPosition(p.side);
                    player = Bodies.polygon(defaultPosition.x, defaultPosition.y, 10, 160, playerOptions);
                    break;
                case 'right':
                    defaultPosition = this.getPlayerDefaultPosition(p.side);
                    player = Bodies.polygon(defaultPosition.x, defaultPosition.y, 10, 160, {render: {fillStyle: 'white'}, ...playerOptions});
                    break;
                default:
                    throw new Error('Сторона не выбрана');
            }

            player.options = {sides: 10, radius:160, ...playerOptions }
            player.playerId = p.playerId;
            player.activeKeys = new Set();
            player.canJump = true;
            // Поворачиваем шестиугольник на 90 градусов (π/2 радиан)
            Body.rotate(player, Math.PI / 2);

            this.players.push(player)
        })

        this.objects.push(...this.players);
        World.add(this.world, this.players);


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
        this.players.forEach(player => {
            this.applyForce(player)
        })
    }
    getSimulationState() {
        return this.objects.map(body =>
        {
            const obj = ({
                    id: body.id,
                    // playerId: body.playerId,
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

    removePlayer(playerId){
        let player = this.players.find(x => x.playerId === playerId);
        World.remove(this.world, player)
        removeElementById(this.objects, playerId)

        return player.id;
    }

    applyForce(player){
        const moveSpeed = 15;
        const jumpSpeed = 20;
        // let player = this.players.find(x => x.playerId === playerId);

        // console.log(player);
        // console.log(this.players);

        if (player.activeKeys.has('jump') && player.canJump && player.jumpCount < 2) {
            Matter.Body.setVelocity(player, { x: player.velocity.x, y: -jumpSpeed });
            player.jumpCount++;
            player.canJump = false; // Блокируем прыжок до отпуска клавиши
        }

        if (player.activeKeys.has('moveRight')) {
            Matter.Body.setVelocity(player, { x: moveSpeed, y: player.velocity.y });
        }

        if (player.activeKeys.has('moveLeft')) {
            Matter.Body.setVelocity(player, { x: -moveSpeed, y: player.velocity.y });
        }

        if (player.activeKeys.has('moveDown')) {
            Matter.Body.setVelocity(player, { x: player.velocity.x, y: jumpSpeed });
        }

        if (player.activeKeys.size === 0) {
            Matter.Body.setVelocity(player, { x: 0, y: player.velocity.y });
        }


    }
}

module.exports = SimulationManager;