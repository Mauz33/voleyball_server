const {SERVER_WIDTH, SERVER_HEIGHT} = require("./config");
const Matter = require("matter-js");

class GameManager{
    constructor(simulation, players, onScoreChange) {
        this.simulation = simulation;
        this.players = players;
        this.roundEnded = false;
        this.score = {left: 0, right: 0};
        this.history = [];
        this.onScoreChange = onScoreChange;

        this.simulation.onBallCollideGround = this.onBallCollision.bind(this);
    }

    onBallCollision(side) {
        if(!this.roundEnded){
            if(side === 'right'){
                this.score.left++;
            }
            else if(side === 'left'){
                this.score.right++;
            }

            if (this.onScoreChange) {
                this.onScoreChange(this.score);
            }

            console.log(this.score);

            this.history.push(side);

            setTimeout(() => {
                this.restartRound();
            }, 3000);
        }
        this.roundEnded = true;
    }

    restartRound(){
        this.roundEnded = false;

        this.resetBall();
        this.resetPlayers();

        this.#setStatic(this.simulation.ball, this.simulation.players, true)
        setTimeout(() => {
            this.#setStatic(this.simulation.ball, this.simulation.players, false)
        }, 3000);

    }
    #setStatic(ball, players, bool){
        Matter.Body.setStatic(ball, bool);

        players.forEach(player => {
            Matter.Body.setStatic(player, bool);
        })
    }

    resetBall() {
        const side = this.inverseSide(this.history[this.history.length-1]);
        let defaultPosition = this.simulation.getBallDefaultPosition(side);

        Matter.Body.setPosition(this.simulation.ball, {x: defaultPosition.x, y: defaultPosition.y})
        Matter.Body.setVelocity(this.simulation.ball, {x: 0, y: 0});
    }

    inverseSide(side) {
        if(side === 'left')
            return 'right'
        else
            return 'left';
    }

    resetPlayers(){
        this.simulation.players.forEach(player => {
            let playerRoom = this.players.find(x => x.playerId === player.playerId)
            // console.log(`game: ${JSON.stringify(playerObject)}`)
            let defaultPosition = this.simulation.getPlayerDefaultPosition(playerRoom.side);
            Matter.Body.setPosition(player, {x: defaultPosition.x, y: defaultPosition.y})
        })
    }

    endGame() {

    }
}

module.exports = GameManager;