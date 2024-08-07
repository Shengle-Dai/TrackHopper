const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cart = {
    x: 100,
    y: 300,
    width: canvas.width / 40,
    height: canvas.height / 40,
    dy: 0,
    gravity: 0.5,
    onTrack: true
};

let score = 0;
let gameOver = false;
let trackSegments = [];
let segmentWidth = canvas.width / 10;
let spacePressed = false;
let maxVerticalSpeed = canvas.height / 100;
let jumping = false;
let jumpingStartHeight = cart.y;
let forceFall = false;

// Initialize track segments
for (let i = 0; i < canvas.width / segmentWidth; i++) {
    if (i < 10) {
        trackSegments.push({ x: i * segmentWidth, y: 300 });
    } else {
        pushNewSegment();
    }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(e) {
    if (e.code === 'Space') {
        spacePressed = true;
    }
    if (e.code === 'Space' && gameOver) {
        restartGame();
    }
}

function handleKeyUp(e) {
    if (e.code === 'Space') {
        spacePressed = false;
        jumping = false;
    }
}

function jump() {
    if (cart.onTrack && spacePressed) {
        jumping = true;
        cart.onTrack = false;
        jumpingStartHeight = cart.y;
    }

    if (jumpingStartHeight - cart.y > canvas.height / 8) {
        forceFall = true;
    }

    if (!forceFall && !cart.onTrack && spacePressed && jumping) {
        if (cart.dy > -maxVerticalSpeed) {
            cart.dy -= canvas.height / 400 - (0.5 * cart.dy);
        }
        else {
            cart.dy = -maxVerticalSpeed;
        }
    }
}

function update() {
    if (gameOver) return;

    // Update cart position
    cart.y += cart.dy;

    if (!cart.onTrack && cart.y < canvas.height) {
        if (cart.dy < maxVerticalSpeed) {
            cart.dy += cart.gravity;
        }
        else {
            cart.dy = maxVerticalSpeed;
        }    
    }

    if (cart.y > canvas.height) {
        gameOver = true;
    }

    // Move track segments
    for (let segment of trackSegments) {
        segment.x -= canvas.width / 200;
    }

    // Remove the leftmost segment and add a new one when needed
    if (trackSegments[0].x < -segmentWidth) {
        trackSegments.shift();
        pushNewSegment();
        score++;
    }

    // Check if cart is on track
    cart.onTrack = false;
    for (let segment of trackSegments) {
        if (((cart.x + cart.width > segment.x && cart.x + cart.width < segment.x + segmentWidth) || (cart.x > segment.x && cart.x < segment.x + segmentWidth)) &&
            cart.y + (2 * cart.dy) >= segment.y && cart.y <= segment.y && cart.dy >= 0) { 
                cart.y = segment.y;
                cart.dy = 0;
                cart.onTrack = true;
                forceFall = false;
                break;
        }
    }

    // Handle jumping
    jump();

    draw();
    requestAnimationFrame(update);
}

function pushNewSegment() {
    let lastSegment = trackSegments[trackSegments.length - 1];
    let gapChance = Math.random();

    if (gapChance < 0.2) {
        let newY = lastSegment.y + Math.random() * canvas.height / 4 - canvas.height / 8;
        trackSegments.push({ x: lastSegment.x + (2 * segmentWidth), y: Math.max(50, Math.min(newY, canvas.height - 30)) });
    } else {
        trackSegments.push({ x: lastSegment.x + segmentWidth, y: lastSegment.y });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cart
    ctx.fillStyle = 'brown';
    ctx.fillRect(cart.x, cart.y - cart.height, cart.width, cart.height);

    // Track
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;
    for (let segment of trackSegments) {
        ctx.beginPath();
        ctx.moveTo(segment.x, segment.y);
        ctx.lineTo(segment.x + segmentWidth, segment.y);
        ctx.stroke();
    }

    // Score
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);

    if (gameOver) {
        ctx.fillText('Game Over - Press Space to Restart', 300, 200);
    }
}

function restartGame() {
    // Reset cart position and state
    cart.x = 50;
    cart.y = 300;
    cart.dy = 0;
    cart.onTrack = true;

    // Reset game state
    score = 0;
    gameOver = false;
    spacePressed = false;
    jumping = false;
    jumpingStartHeight = 0;

    // Reset track segments
    trackSegments = [];
    for (let i = 0; i < canvas.width / segmentWidth; i++) {
        if (i < 10) {
            trackSegments.push({ x: i * segmentWidth, y: 300 });
        } else {
            pushNewSegment();
        }
    }

    // Start the game loop again
    update();
}

update();
