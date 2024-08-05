const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cart = {
    x: 50,
    y: 300,
    width: 20,
    height: 20,
    dy: 0,
    gravity: 0.5,
    jumpVelocity: 10,
    onTrack: true
};

let score = 0;
let gameOver = false;
let trackSegments = [];
let segmentWidth = 50;
let spacePressed = false;

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
}

function handleKeyUp(e) {
    if (e.code === 'Space') {
        spacePressed = false;
    }
}

function jump() {
    if (cart.onTrack && spacePressed) {
        cart.dy = -cart.jumpVelocity;
        cart.onTrack = false;
    }
}

function update() {
    if (gameOver) return;

    // Update cart position
    cart.y += cart.dy;

    if (!cart.onTrack && cart.y < canvas.height) {
        cart.dy += cart.gravity; 
    }

    if (cart.y > canvas.height) {
        gameOver = true;
    }

    // Move track segments
    for (let segment of trackSegments) {
        segment.x -= 3;
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
        if (cart.x + cart.width > segment.x && cart.x < segment.x + segmentWidth &&
            cart.y + cart.dy >= segment.y && cart.y <= segment.y && cart.dy >= 0) { 
                cart.y = segment.y;
                cart.dy = 0;
                cart.onTrack = true;
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
    let diff = Math.random() * 100 - 50;
    let newY = (diff > -20 && diff < 20) ? lastSegment.y : lastSegment.y + diff;
    newY = Math.max(200, Math.min(350, newY));
    trackSegments.push({ x: lastSegment.x + segmentWidth, y: newY });
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
        ctx.fillText('Game Over', 350, 200);
    }
}

update();
