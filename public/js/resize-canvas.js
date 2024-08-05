const gameCanvas = document.getElementById('gameCanvas');

const SERVER_WIDTH = 3840;
const SERVER_HEIGHT = 2160;

let scaleX = 1;
let scaleY = 1;

function resizeCanvas() {
    const aspectRatio = 16 / 9;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    if (windowAspectRatio > aspectRatio) {
        // Wider than 16:9
        gameCanvas.style.width = `${windowHeight * aspectRatio}px`;
        gameCanvas.style.height = `${windowHeight}px`;
    } else {
        // Taller than 16:9
        gameCanvas.style.width = `${windowWidth}px`;
        gameCanvas.style.height = `${windowWidth / aspectRatio}px`;
    }

    scaleX = gameCanvas.width / SERVER_WIDTH;
    scaleY = gameCanvas.height / SERVER_HEIGHT;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

