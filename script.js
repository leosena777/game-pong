const canvas = document.querySelector("canvas");
canvas.width = 800;
canvas.height = 400;

const ctx = canvas.getContext("2d");

const paddleWidth = 8;
const paddleHeight = 80;
const ballRadius = 10;

let gameRunning = false;
let gameLoop = null;
let playScore = 0;
let computerScore = 0;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let playerPosition = canvas.height / 2 - paddleHeight / 2;
let moveX = 2;
let moveY = 1;
let computerYPosition = canvas.height / 2 - paddleHeight / 2;
let countDown = 3;

const ballTrail = [];

const spacePostion = {
  x: canvas.width / 2 - 100,
  y: canvas.height / 2 + 50,
  offset: 5,
};

function renderInitMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "35px Tahoma";
  ctx.textAlign = "center";
  ctx.fillText("Press space to start", canvas.width / 2, canvas.height / 2);

  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.roundRect(spacePostion.x, spacePostion.y, 200, 50, 10);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect(
    spacePostion.x + spacePostion.offset,
    spacePostion.y - spacePostion.offset,
    200,
    50,
    10
  );
  ctx.strokeStyle = "white";
  ctx.fillStyle = "#075100";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.font = "bold 22px Tahoma";
  ctx.fillStyle = "white";
  ctx.fillText(
    "Space",
    canvas.width / 2 + spacePostion.offset,
    canvas.height / 2 + 82 - spacePostion.offset
  );
  ctx.closePath();

  if (spacePostion.offset === 5) {
    spacePostion.offset = 0;
  } else {
    spacePostion.offset = 5;
  }
}

renderInitMenu();
const menuInteval = setInterval(() => {
  renderInitMenu();
}, 600);

function randomMovement() {
  const randomX = Math.floor(Math.random() * 2) + 2;
  const randomY = Math.round(Math.random() * 2) + 1;

  const conditionX = Math.random() < 0.5 ? -1 : 1;
  const conditionY = Math.random() < 0.5 ? -1 : 1;

  moveX = randomX * conditionX;
  moveY = randomY * conditionY;
}

function countDownToStart() {
  countDown = 3;

  const countDownInterval = setInterval(() => {
    countDown--;

    if (countDown === 0) {
      clearInterval(countDownInterval);
    }
  }, 1000);
}

function startGame() {
  clearInterval(menuInteval);

  if (!gameRunning) {
    gameRunning = true;
    playScore = 0;
    computerScore = 0;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    clearInterval(gameLoop);
    randomMovement();

    countDownToStart();

    gameLoop = setInterval(loop, 10);
  }
}

function onKeyPress(event) {
  switch (event.key) {
    case "ArrowUp":
      if (playerPosition > 0) {
        playerPosition -= 30;
      }
      break;
    case "ArrowDown":
      if (playerPosition < canvas.height - paddleHeight) {
        playerPosition += 30;
      }
      break;
    case " ":
      startGame();
      break;
  }
}

document.addEventListener("keydown", onKeyPress);

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();

  ballX += moveX;
  ballY += moveY;

  ballTrail.push({ x: ballX, y: ballY });
}

function drawBallTrail() {
  const lastBalls = ballTrail.slice(-40);

  lastBalls.forEach((ball, index) => {
    const opacity = (index / lastBalls.length) * 0.4;
    const size = ballRadius * (index / lastBalls.length) * 0.9;

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.globalAlpha = opacity;
    ctx.arc(ball.x, ball.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  ctx.globalAlpha = 1;
}

const drawPlayerPaddle = () => {
  ctx.fillStyle = "white";
  ctx.fillRect(2, playerPosition, paddleWidth, paddleHeight);
};

const drawComputerPaddle = () => {
  ctx.fillStyle = "white";
  ctx.fillRect(
    canvas.width - paddleWidth - 2,
    computerYPosition,
    paddleWidth,
    paddleHeight
  );
};

const drawScore = () => {
  ctx.fillStyle = "white";
  ctx.font = "30px Tahoma";

  ctx.fillText(playScore, canvas.width / 4, 50);

  ctx.fillStyle = "white";
  ctx.fillText(computerScore, canvas.width * 0.75, 50);
};

const drawBackground = () => {
  ctx.beginPath();
  ctx.setLineDash([canvas.height / 2 - 20, 40]);
  ctx.strokeStyle = "#fff";
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, Math.PI * 2);
  ctx.stroke();

  if (countDown > 0) {
    ctx.font = "30px Tahoma";
    ctx.fillText(countDown, canvas.width / 2, canvas.height / 2 + 10);
  }
};

function colider() {
  // bounce
  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    moveY *= -1;
  }

  // check for score
  if (ballX + ballRadius > canvas.width) {
    playScore++;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    moveX *= -1;
  }

  if (ballX - ballRadius < 0) {
    computerScore++;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    moveX *= -1;
  }

  // check for paddle player contact
  if (
    ballX - ballRadius < paddleWidth &&
    ballY + ballRadius > playerPosition &&
    ballY - ballRadius < playerPosition + paddleHeight
  ) {
    moveX = moveX * -1 + generateRandomBounce();
  }

  // check for paddle computer contact
  if (
    ballX + ballRadius > canvas.width - paddleWidth &&
    ballY + ballRadius > computerYPosition &&
    ballY - ballRadius < computerYPosition + paddleHeight
  ) {
    moveX = moveX * -1 + generateRandomBounce();
  }
}

function endGame(winner) {
  gameRunning = false;
  clearInterval(gameLoop);

  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "50px Tahoma";
  ctx.fillText(`${winner} wins!`, canvas.width / 2, canvas.height / 2);
  drawScore();
  ctx.closePath();
}

function rules() {
  if (playScore === 5) {
    endGame("player");
  }

  if (computerScore === 5) {
    endGame("computer");
  }
}

function moveComputerPaddle() {
  if (ballY > computerYPosition + paddleHeight / 2) {
    computerYPosition += 2;
  }

  if (ballY < computerYPosition + paddleHeight / 2) {
    computerYPosition -= 2;
  }
}

function generateRandomBounce() {
  const number = Math.floor(Math.random() * 2);
  const condition = number === 0 ? -1 : 1;

  return (number * condition) / 2;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (countDown === 0) {
    drawBallTrail();
    drawBall();
    drawPlayerPaddle();
    drawComputerPaddle();
    drawScore();
    colider();
    rules();
    moveComputerPaddle();
  }
}
