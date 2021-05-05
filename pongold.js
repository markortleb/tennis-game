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

var player = {
    height: 50,
    width: 20,
    speed: 20,
    color: "white",
    ctx: null,
    draw: function (){
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_COLOR;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    init: function (){
        this.x = ORIGIN.x + FIELD_WIDTH - 2 * PLAYER_MARGIN.x;
        this.y = ORIGIN.y + FIELD_HEIGHT / 2 - this.height / 2;
    },
    clear: function (){
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_COLOR;
        this.ctx.fillStyle = FIELD_COLOR;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update: function (x, y){
        this.x = x;
        this.y = y;
    }

};

var computer = {
    height: 50,
    width: 20,
    speed: 20,
    color: "white",
    ctx: null,
    draw: function (){
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_COLOR;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    init: function (){
        this.x = ORIGIN.x + PLAYER_MARGIN.x;
        this.y = ORIGIN.y + FIELD_HEIGHT / 2 - this.height / 2;
    },
    clear: function (){
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_COLOR;
        this.ctx.fillStyle = FIELD_COLOR;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update: function (x, y){
        this.x = x;
        this.y = y;
    }
};

var ball = {
    height: 20,
    width: 20,
    speed: 1,
    color: "white",
    direction: 0,
    ctx: null,
    bounceY: false,
    bounceX: false,
    draw: function (){
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_COLOR;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    init: function (){
        // Set ball's initial direction
        let random1 = getRandomInt(0, 45);
        let random2 = getRandomInt(135, 270);
        let random3 = getRandomInt(315, 360)
        if (Math.random() < 0.5) {
            if (Math.random() < 0.5){
                this.direction = random1;
            } else{
                this.direction = random3;
            }

        } else {
            this.direction = random2;
        }

        this.direction = 0;
        this.x = ORIGIN.x + FIELD_WIDTH / 2 - this.width / 2;
        this.y = ORIGIN.y + FIELD_HEIGHT / 2 - this.height / 2;

        this.nextX = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.nextY = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);

    },
    clear: function (){
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_COLOR;
        this.ctx.fillStyle = FIELD_COLOR;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update: function (){
        this.x = this.nextX;
        this.y = this.nextY;
        this.nextX = this.x + this.speed * Math.cos(this.direction * Math.PI / 180);
        this.nextY = this.y + this.speed * Math.sin(this.direction * Math.PI / 180);


        if (this.bounceY){
            this.nextY = this.y - this.speed * Math.sin(this.direction * Math.PI / 180);
            this.bounceY = false;
        }
        if (this.bounceX){
            this.nextX = this.x - this.speed * Math.cos(this.direction * Math.PI / 180);
            this.bounceX = false;
        }

        if (this.nextY < ORIGIN.y){
            // Top Collision
            this.nextY = ORIGIN.y;
            this.bounceY = true;
        } else if (this.nextY > ORIGIN.y + FIELD_HEIGHT - this.height){
            // Bottom Collision
            this.nextY = ORIGIN.y + FIELD_HEIGHT - this.height;
            this.bounceY = true;
        }

        // Player Collision With Ball From Side
        if (this.nextX + this.width >= player.x && player.x + player.width >= this.nextX + this.width &&
            (
                player.y <= this.nextY &&
                this.nextY <= player.y + player.height ||
                player.y <= this.nextY + this.height &&
                this.nextY + this.height <= player.y + player.height
            )
        ){
            this.nextX = player.x - this.width;
            this.bounceX = true;
        }

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


        console.log(this.direction);

    }
};

function processKeyDown(e){
    if(e.key === "ArrowDown"){
        if (player.y + player.height + 20 < ORIGIN.y + CANVAS_HEIGHT - 20) {
            player.update(player.x, player.y + 20);
        }
    }else if(e.key === "ArrowUp"){
        if (player.y - 20 > ORIGIN.y) {
            player.update(player.x, player.y - 20);
        }
    }
}

document.addEventListener('keydown', processKeyDown);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function paint(ctx){
    // Paint Field
    ctx.clearRect(ORIGIN.x, ORIGIN.y, FIELD_WIDTH, FIELD_HEIGHT);
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.rect(ORIGIN.x, ORIGIN.y, FIELD_WIDTH, FIELD_HEIGHT);
    ctx.fill();

    drawMiddleLine(ctx);

    player.draw();
    computer.draw();
    ball.draw();
}


function init(ctx){
    ball.ctx = ctx;
    player.ctx = ctx;
    computer.ctx = ctx;

    ball.init();
    player.init();
    computer.init();
}


function drawMiddleLine(ctx){
    // Draw middle line
    ctx.moveTo(ORIGIN.x + FIELD_WIDTH / 2, ORIGIN.y);
    ctx.lineTo(ORIGIN.y + FIELD_WIDTH / 2, ORIGIN.y + FIELD_HEIGHT);
    ctx.strokeStyle = "white";
    ctx.stroke();
}





async function playGame(ctx){
    init(ctx);
    paint(ctx);

    console.log(ball.direction);
    var stillPlaying = true;
    var ctr = 0;
    var maxCtr = 100000;
    while (stillPlaying){

        ball.update();

        paint(ctx)

        await sleep(10);

        ctr++;
        if (ctr >= maxCtr){
            stillPlaying = false;
        }
    }

}


function main() {
    var canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");


    // Draw background

    playGame(ctx);
}

main();
