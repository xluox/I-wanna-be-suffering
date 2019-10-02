var myGamePiece;
var obstacles = [];
var buildings = [];
var myObstacle;
var myObstacle2;
var myScore;
var lifeUsed = 0;
var jumpConst = 2;
var keyTime = jumpConst;
var onGround = false;
var onBlock = false;
// var top = 0;
// var bottom = 510;
// var leftEdge = 30;
// var rightEdge = 930;
var Ctop = 0;
var Cbottom = 510;
var CleftEdge = 30;
var CrightEdge = 930;
var Hspeed = 0;
var moveSpeed = 2;
var jumpSpeed = 5;
var intervalRate = 10;
var baseLevel = 0;
var level = 0;


function startGame() {
    myGameArea.start();
    obstacles = getObstacles(baseLevel);
    buildings = getBuildings(baseLevel);
    myGamePiece = getPlayer();
    myScore = new component("30px", "Consolas", "black", 780, 40, "text");

}
function getPlayer(){
    player =  new component(15, 15, "red", 40, 330);
    player.gravity = 0.3;
    return player;
}
function getPlayerFromLeft(){
    player =  new component(15, 15, "red", CleftEdge-20, Cbottom-11);
    player.gravity = 0.3;
    return player;
}
function getPlayerFromRight(){
    player =  new component(15, 15, "red", CrightEdge+20, Cbottom-11);
    player.gravity = 0.3;
    return player;
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 960;
        this.canvas.height = 540;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;        
        this.interval = setInterval(updateGameArea, intervalRate);
        window.addEventListener('keydown', function (e) {
            // console.log(e.key);
            if(e.key == "ArrowUp" && keyTime > 0){ jump();}
            if (e.key == "r") {myGameArea.restart(); }

            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);

    },
    restart : function(){
        // console.log("Hspeed: " + Hspeed);
        clearInterval(this.interval);
        this.interval = setInterval(updateGameArea, intervalRate);
        obstacles = getObstacles(level);
        myGamePiece = getPlayer();
        lifeUsed++;
    }
}


function component(width, height, color, x, y, type) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.gamearea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;   
    this.gravity = 0.05;
    this.gravitySpeed = 0; 
    this.speedLimit = 10;
    this.x = x;
    this.y = y;
    this.direction = 0;
    this.update = function() {
        ctx = myGameArea.context;
        if (type == "image") {
            ctx.drawImage(this.image, 
            this.x, 
            this.y,
            this.width, this.height);
        }    
        else if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        if(this.gravitySpeed > this.speedLimit){
            this.gravitySpeed = this.speedLimit;
        }
        this.x += this.speedX;
        this.y += this.gravitySpeed;  

        for (i of buildings){
            this.hitBuilding(i);
        }
        this.reachLevelPoint();
         
    }
    this.hitBuilding = function(object){

        // stand on top
        if (this.y >= (object.y - this.height -4) && 
        this.y + this.height <= (object.y  +5) &&
        (this.x < (object.x + object.width)) &&
        (this.x > (object.x - this.width))      ) {
            this.gravitySpeed = 0;
            this.y = object.y - this.height ;
            keyTime = jumpConst;
        }

        // hit from left
        else if ((this.y <= (object.y + object.height)) && 
        (this.y > (object.y - this.height)) &&
        (this.x < (object.x - this.width)+3 ) &&
        (this.x > (object.x - this.width))) {
            this.x = object.x - this.width;
        }

        // hit from right
        else if ((this.y <= (object.y + object.height)) && 
        (this.y > (object.y - this.height)) &&
        (this.x < (object.x + object.width) ) &&
        (this.x > (object.x + object.width)-3 )) {
            this.x = object.x + object.width;
        }
        // hit from bottom
        else if ((this.y <= (object.y + object.height)) && 
        (this.y > (object.y + object.height) - 5) &&
        (this.x < (object.x + object.width)) &&
        (this.x > (object.x - this.width))) {
            this.gravitySpeed = 0;
            this.y = object.y + object.height;
        }
        

        
    }


    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }

    this.reachLevelPoint = function(){
        if(this.x > CrightEdge + 30){
            level++;
            console.log("level changed: " + level);
            obstacles = getObstacles(level);
            buildings = getBuildings(level);
            myGamePiece = getPlayerFromLeft();

        }
        else if(this.x+this.width < CleftEdge-30){
            level--;
            console.log("level changed: " + level);
            obstacles = getObstacles(level);
            buildings = getBuildings(level);
            myGamePiece = getPlayerFromRight();

        }


    }

    this.crashWithTriangle = function(object){

    }
}

function updateGameArea() {

    myGameArea.clear();
    for (i of obstacles){
        i.trapMove();
        i.update();
        if(myGamePiece.crashWith(i) ){
            myGameArea.stop();
        }
    }
    for (i of buildings){
        i.update();
    }


    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;    
    if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.speedX = -moveSpeed; }
    if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.speedX = moveSpeed; }

    myScore.text = "Life used: " + lifeUsed;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();

}
function jump(){
    // console.log("Jump!!!");
    accelerate(-jumpSpeed); 
    keyTime -= 1;
}
function accelerate(n) {
  myGamePiece.gravitySpeed = n;
}


