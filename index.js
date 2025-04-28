/*--Initial----------------------------------------------------------------------------------------------------------------------------------------*/
window.oncontextmenu = (e)=>{e.preventDefault()}
window.onresize = resize;
window.onload = initLoad;

function resize(){
    let backgroundCanvas = document.querySelector("#backgroundCanvas");
    backgroundCanvas.height = window.innerHeight;
    backgroundCanvas.width = window.innerWidth;

    let gameCanvas = document.querySelector("#gameCanvas");
    gameCanvas.height = window.innerHeight;
    gameCanvas.width = window.innerWidth;

    if(game.started){
        if(gameLoopRunning){
            pausedText.style.display = "block";
            backLoopRunning = false;
            gameLoopRunning = false;
        }
        let ctx = gameCanvas.getContext("2d");
        drawGame(ctx);
        drawClouds();
    }
}
function initLoad(){
    resize();
    loadImages();
    startBackLoop();
    initGame();

    game.over = false;
    game.started = false;
    
    document.querySelector(".gameWindow").style.display = "block";
    document.querySelector(".loadingScreen").style.display = "none";
    document.querySelector("#gameR").onclick = ()=>{
        document.querySelector("#gameOverWindow").style.display = "none";
        game.over = false;
        startBackLoop();
        initGame();
    }
}
function random(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function loadImages(){
    let pipeHead = new Image(); pipeHead.src = "images/pipe-head.png";
    let pipeBody = new Image(); pipeBody.src = "images/pipe-body.png";
    game.images = [pipeBody,pipeHead];

    let bee1 = new Image(); bee1.src = "images/bee1.png";
    let bee2 = new Image(); bee2.src = "images/bee2.png";
    let bee3 = new Image(); bee3.src = "images/bee3.png";
    player.images = [bee1,bee2,bee3];
}

/*--Background-------------------------------------------------------------------------------------------------------------------------------------*/
let backLoopRunning = false, clouds = [];
function startBackLoop(){
    backLoopRunning = true;
    let currBackTime, prevBackTime;
    window.requestAnimationFrame((currTime)=>{
        currBackTime = currTime;
        prevBackTime = currTime;
        backLoop(currBackTime,prevBackTime);
    });
}
function backLoop(currTime,prevTime){
    if(backLoopRunning){
        let elapsedTime = currTime - prevTime;
        if(elapsedTime > 16){
            prevTime = currTime;
            if(clouds.length === 0){
                for(let i = 0; i < 10; i++){
                    let newCloudIndex = random(1,4);
                    let cloudImage = new Image();
                    cloudImage.src = "images/cloud"+newCloudIndex+".png";
        
                    let newCloud = {};
                    newCloud.y = random(0,window.innerHeight*0.5);
                    newCloud.x = random(0,window.innerWidth);
                    newCloud.s = random(1,5);
                    newCloud.i = cloudImage;
                    clouds.push(newCloud);
                }
            }
            else{
                for(let i = 0; i < clouds.length; i++){
                    clouds[i].x -= window.innerWidth*0.001*(10+clouds[i].s)/10;
                    if(clouds[i].x < -window.innerHeight*0.15) clouds.splice(i,1);
                }
                if(clouds.length < 10){
                    let newCloudIndex = random(1,4);
                    let cloudImage = new Image();
                    cloudImage.src = "images/cloud"+newCloudIndex+".png";
        
                    let newCloud = {};
                    newCloud.y = random(0,window.innerHeight*0.5);
                    newCloud.x = window.innerWidth;
                    newCloud.s = random(1,5);
                    newCloud.i = cloudImage;
                    clouds.push(newCloud);
                }
            }
            drawClouds();
        }
        window.requestAnimationFrame((currTime)=>{backLoop(currTime,prevTime)});
    }
}
function drawClouds(){
    let backgroundCanvas = document.querySelector("#backgroundCanvas");
    let ctx = backgroundCanvas.getContext("2d");
    ctx.clearRect(0,0,backgroundCanvas.width,backgroundCanvas.height);

    let cloudWidth = window.innerHeight*0.15;
    let cloudHeight = cloudWidth/2.13;
    for(let i = 0; i < clouds.length; i++){
        ctx.drawImage(clouds[i].i,clouds[i].x,clouds[i].y,cloudWidth,cloudHeight);
    }
}

/*--Game-------------------------------------------------------------------------------------------------------------------------------------------*/
let gameLoopRunning = false, game = {}, player = {};
function initGame(){
    game.adjustLeft = 0;
    game.obstacles = [];
    game.tick = 0;

    player.y = window.innerHeight*0.4;
    player.oldScore = 0;
    player.score = 0;
    player.angle = 0;
    player.tick = 1;
    player.dir = 1;
    player.x = 100;
    player.f = 0;

    document.querySelector(".gameScore").innerText = player.score;
    document.querySelector("#gameInfo").style.display = "block";
    let gameCanvas = document.querySelector("#gameCanvas");
    let ctx = gameCanvas.getContext("2d");
    drawGame(ctx);
}
function startGameLoop(){
    document.querySelector("#gameInfo").style.display = "none";
    let gameCanvas = document.querySelector("#gameCanvas");
    let ctx = gameCanvas.getContext("2d");

    game.started = true;
    gameLoopRunning = true;
    let currGameTime, prevGameTime;
    window.requestAnimationFrame((currTime)=>{
        currGameTime = currTime;
        prevGameTime = currTime;
        gameLoop(currGameTime,prevGameTime,ctx);
    });
}
function gameLoop(currTime,prevTime,ctx){
    if(gameLoopRunning){
        let elapsedTime = currTime - prevTime;
        if(elapsedTime > 16){
            prevTime = currTime;
            updateGame(elapsedTime);
            drawGame(ctx);
            collision();
        }
        window.requestAnimationFrame((currTime)=>{gameLoop(currTime,prevTime,ctx)});
    }
}
function updateGame(elapsedTime){
    game.tick++;
    if(game.tick >= 100) game.tick = 0;
    if(game.tick % 10 === 0){
        player.tick += player.dir;
        if(player.tick > 2) player.dir = -1;
        else if(player.tick < 2) player.dir = 1;
    }
    if(game.tick % 50 === 0){
        let pipeSet = random(2,6);
        let pipeTop = random(1,9-pipeSet);
        game.obstacles.push({
            x:screen.width*1.1+game.adjustLeft,
            pipeSet:pipeSet,
            pipeTop:pipeTop
        });
    }
    if(game.obstacles.length > 0){
        let behindPlayer =  game.adjustLeft-window.innerHeight*0.1*0.95+100;
        if(game.obstacles[0].x < behindPlayer){
            if(player.score === player.oldScore){
                player.score++;
                document.querySelector(".gameScore").innerText = player.score;
            }
            if(game.obstacles[0].x < behindPlayer-100){
                game.obstacles.splice(0,1);
                player.oldScore++;
            }
        }
    }
    let distX = elapsedTime/2;
    game.adjustLeft += distX;
    player.x += distX;

    let gravity = window.innerHeight*0.0005;
    player.y += gravity+player.f;
    player.f += gravity;

    if(player.angle < Math.PI/2) player.angle += Math.PI/72;
    if(player.angle > Math.PI/2) player.angle = Math.PI/2;
}
function drawGame(ctx){
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    let playerImg = player.images[(player.tick-1)];
    let playerHeight = window.innerHeight*0.1;
    let playerWidth = playerHeight*0.95;

    for(let i = 0; i < game.obstacles.length; i++){
        let obs = game.obstacles[i];
        let gap = window.innerHeight*obs.pipeSet/10;
        let height1 = window.innerHeight*obs.pipeTop/10;
        let height2 = window.innerHeight-height1-gap;
        let headWidth = playerWidth*1.1;
        let headHeight = headWidth/2.715;
       
        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(game.images[0],obs.x-game.adjustLeft,0,playerWidth,height1);
        ctx.closePath();

        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(game.images[1],obs.x-game.adjustLeft-playerWidth*0.05,height1-headHeight,headWidth,headHeight);
        ctx.closePath();

        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(game.images[0],obs.x-game.adjustLeft,height1+gap,playerWidth,height2);
        ctx.closePath();

        ctx.beginPath();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(game.images[1],obs.x-game.adjustLeft-playerWidth*0.05,height1+gap,headWidth,headHeight);
        ctx.closePath();
    }
    
    ctx.beginPath();
    ctx.save();
    ctx.translate(player.x-game.adjustLeft+playerWidth/2,player.y+playerHeight/2);
    ctx.rotate(player.angle);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(playerImg,-playerWidth/2,-playerHeight/2,playerWidth,playerHeight);
    ctx.restore();
    ctx.closePath();
}
function collision(){
    if(player.y > window.innerHeight) gameOver();
    if(player.y < -window.innerHeight*0.05) player.y = -window.innerHeight*0.05;
    if(game.obstacles.length > 0){
        let obs = game.obstacles[0];
        let gap = window.innerHeight*obs.pipeSet/10;
        let height1 = window.innerHeight*obs.pipeTop/10;
        let height2 = window.innerHeight-height1-gap;
        let playerHeight = window.innerHeight*0.1;
        let playerWidth = playerHeight*0.95;

        let playerCircle = {x:player.x-game.adjustLeft+playerWidth/2,y:player.y+playerHeight*0.55,r:playerWidth*0.32};
        let obsRect1 = {x:obs.x-game.adjustLeft,y:0,w:playerWidth,h:height1};
        let obsRect2 = {x:obs.x-game.adjustLeft,y:height1+gap,w:playerWidth,h:height2};
        if(rectCircleCollision(playerCircle,obsRect1) || rectCircleCollision(playerCircle,obsRect2)) gameOver();
    }
}
function rectCircleCollision(circle,rect){
    let distX = Math.abs(circle.x - rect.x-rect.w/2);
    let distY = Math.abs(circle.y - rect.y-rect.h/2);

    if(distX > (rect.w/2 + circle.r)) return false;
    if(distY > (rect.h/2 + circle.r)) return false;
    if(distX <= (rect.w/2)) return true;
    if(distY <= (rect.h/2)) return true;

    let dx = distX - rect.w/2;
    let dy = distY - rect.h/2;
    return (dx * dx + dy * dy <= (circle.r * circle.r));
}
function jump(){
    if(gameLoopRunning){
        let gravity = window.innerHeight*0.0005;
        player.f = -20*gravity;
        player.angle = -Math.PI*0.4;
    }
}
function pause(){
    let pausedText = document.querySelector("#pausedText");
    if(gameLoopRunning){
        pausedText.style.display = "block";
        backLoopRunning = false;
        gameLoopRunning = false;
    }
    else{
        pausedText.style.display = "none";
        startBackLoop();
        startGameLoop();
    }
}
function gameOver(){
    game.over = true;
    game.started = false;
    gameLoopRunning = false;
    backLoopRunning = false;
    document.querySelector("#gameOverWindow").style.display = "block";
}

/*--Keyboard---------------------------------------------------------------------------------------------------------------------------------------*/
window.onkeydown = (e)=>{
    if(!game.started && !game.over && e.key === " ") startGameLoop();
    else if(game.started){
        switch(e.key){
            default:break;
            case " ":jump();break;
            case "p":pause();break;
            case "P":pause();break;
        }
    }
}
window.ontouchstart = (e)=>{
    e.preventDefault();
    if(!game.started && !game.over && e.key === " ") startGameLoop();
    else if(game.started) jump();
}