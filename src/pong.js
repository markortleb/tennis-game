const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

const ORIGIN = {
    x: 20,
    y: 20
};

const PLAYER_MARGIN = {
    x: 20,
    y: 20
};

const FIELD_WIDTH = CANVAS_WIDTH - ORIGIN.x;
const FIELD_HEIGHT = CANVAS_HEIGHT - ORIGIN.y;
const FIELD_COLOR = "black";


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function collisionDetection(rect1, rect2) {
    if (rect1.nextX < rect2.nextX + rect2.width && rect1.nextX + rect1.width > rect2.nextX &&
        rect1.nextY < rect2.nextY + rect2.height && rect1.height + rect1.nextY > rect2.nextY) {
        return true;
    }
    return false;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


const paddle = (ctx, orientation, handler) => ({
    height: 52,
    width: 20,
    speed: 6,
    color: "white",
    ctx,
    orientation,
    handler,
    draw: function (){
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_COLOR;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    init: function (){
        if (orientation === 'left'){
            this.x = ORIGIN.x + PLAYER_MARGIN.x;
            this.y = ORIGIN.y + FIELD_HEIGHT / 2 - this.height / 2;
        } else {
            this.x = ORIGIN.x + FIELD_WIDTH - 2 * PLAYER_MARGIN.x;
            this.y = ORIGIN.y + FIELD_HEIGHT / 2 - this.height / 2;
        }

        // We consider a ball as a vector, so use next X and Y here too. Lazy solution
        this.nextX = this.x;
        this.nextY = this.y;

    },
    update: function (x, y){
        this.x = x;
        this.y = y;
        this.nextX = x;
        this.nextY = y;
    }
})


const ball = (ctx) => {
    return ({
        height: 20,
        width: 20,
        speed: 8,
        color: "white",
        direction: 0,
        bounceY: false,
        bounceX: false,
        tol: 0.0005,
        ctx,
        entities: [],
        draw: function () {
            this.ctx.beginPath();
            this.ctx.strokeStyle = FIELD_COLOR;
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        init: function () {
            // Set ball's initial direction
            let random1 = getRandomInt(0, 45);
            let random2 = getRandomInt(135, 270);
            let random3 = getRandomInt(315, 360)
            if (Math.random() < 0.5) {
                if (Math.random() < 0.5) {
                    this.direction = random1;
                } else {
                    this.direction = random3;
                }

            } else {
                this.direction = random2;
            }

            // this.direction = 0;
            this.x = ORIGIN.x + FIELD_WIDTH / 2 - this.width / 2;
            this.y = ORIGIN.y + FIELD_HEIGHT / 2 - this.height / 2;

            this.nextX = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
            this.nextY = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);

        },
        update: function (entities) {
            this.entities = entities;
            this.x = this.nextX;
            this.y = this.nextY;
            this.nextX = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
            this.nextY = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);

            // Reverse x or y if there is a bounce
            if (this.bounceY){
                this.nextY = this.y - this.speed * Math.sin(this.direction * Math.PI / 180);
                this.bounceY = false;
            }
            if (this.bounceX){
                this.nextX = this.x - this.speed * Math.cos(this.direction * Math.PI / 180);
                this.bounceX = false;
            }

            // Recalculate Direction
            var atan_result = Math.atan((this.nextY - this.y) / (this.nextX - this.x)) * 180/ Math.PI;

            if (this.nextX >= this.x && this.nextY > this.y){
                // First Quadrant
                this.direction = atan_result
            } else if (this.nextX < this.x && this.nextY >= this.y){
                // Second Quadrant
                this.direction = 180 + atan_result
            } else if (this.nextX <= this.x && this.nextY < this.y){
                // Third Quadrant
                this.direction = 180 + atan_result
            }
            else if (this.nextX > this.x && this.nextY <= this.y) {
                // Fourth Quadrant
                this.direction = 360 + atan_result

            }

            // Check for collision with entity
            for (const entity of this.entities) {
                if (collisionDetection(this, entity)){
                    this.bounceX = true;
                }
                if (this.bounceX){
                    if (entity.nextX > ORIGIN.x + FIELD_WIDTH / 2){
                        this.nextX = entity.nextX - this.width;
                    } else{
                        this.nextX = entity.nextX + entity.width;
                    }
                    break;
                }
            }

            // Check for collision with floor or ceiling
            if (this.nextY < ORIGIN.y){
                this.nextY = ORIGIN.y;
                this.bounceY = true;
            } else if (this.nextY + this.height > ORIGIN.y + FIELD_HEIGHT){
                this.nextY = ORIGIN.y + FIELD_HEIGHT - this.height;
                this.bounceY = true;
            }



        }
    });
}


const manualHandler = paddleObject => ({
    paddleObject,
    init: function (){
        document.addEventListener('keydown', this.processKeyDown);
        document.addEventListener('keyup', this.processKeyUp);
        paddleObject.currentKey = null;
        paddleObject.keyIsDown = false;
    },
    processKeyDown: function (e){
        paddleObject.currentKey = e.key;
        paddleObject.keyIsDown = true;
    },
    processKeyUp: function (e){
        paddleObject.currentKey = null;
        paddleObject.keyIsDown = false;
    },
    movePaddle: function (){
        if (paddleObject.keyIsDown){
            if (paddleObject.currentKey === "ArrowDown"){
                if (paddleObject.y + paddleObject.height + paddleObject.speed
                    < ORIGIN.y + CANVAS_HEIGHT - paddleObject.speed) {
                    paddleObject.update(paddleObject.x, paddleObject.y + paddleObject.speed);
                }
            }else if (paddleObject.currentKey === "ArrowUp"){
                if (paddleObject.y - paddleObject.speed > ORIGIN.y) {
                    paddleObject.update(paddleObject.x, paddleObject.y - paddleObject.speed);
                }
            }
        }
    }
})


const aiHandler = paddleObject => ({
    paddleObject,
    movePaddle: function (ballObj){
        // var paddleCenterY = paddleObject.nextY + paddleObject.height / 2;
        if (ballObj.y + ballObj.height > paddleObject.y + paddleObject.height){
            paddleObject.update(paddleObject.x, paddleObject.y + paddleObject.speed)
        } else if (ballObj.y < paddleObject.y) {
            paddleObject.update(paddleObject.x, paddleObject.y - paddleObject.speed)
        }

    }

})


function drawMiddleLine(ctx){
    // Draw middle line
    ctx.moveTo(ORIGIN.x + FIELD_WIDTH / 2, ORIGIN.y);
    ctx.lineTo(ORIGIN.x + FIELD_WIDTH / 2, ORIGIN.y + FIELD_HEIGHT);
    ctx.strokeStyle = "white";
    ctx.stroke();
}


function paint(ctx, player, computer, gameBall){
    // Paint Field
    ctx.clearRect(ORIGIN.x, ORIGIN.y, FIELD_WIDTH, FIELD_HEIGHT);
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.rect(ORIGIN.x, ORIGIN.y, FIELD_WIDTH, FIELD_HEIGHT);
    ctx.fill();

    drawMiddleLine(ctx);

    player.draw();
    computer.draw();
    gameBall.draw();
}


async function playGame(ctx){
    var player = paddle(ctx, 'right');
    var computer = paddle(ctx, 'left');
    var gameBall = ball(ctx);
    var playerHandler = manualHandler(player);
    var computerHandler = aiHandler(computer);

    player.init();
    computer.init();
    playerHandler.init();

    gameBall.init();

    var keepPlaying = true;
    while (keepPlaying){
        computerHandler.movePaddle(gameBall);
        playerHandler.movePaddle();
        gameBall.update([player, computer]);
        paint(ctx, player, computer, gameBall);
        await sleep(10);
    }


}


function main() {
    var canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    playGame(ctx);
}


main();
