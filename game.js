var DELAY = 20;
var SPEED = 5;
var OBSTACLE_SPEED = 5;
var COIN_SPEED = 5;
var MAX_DY = 6;

var TW = 10;
var MAX_TH = 20;
var MIN_TH = 50;
var TS = 5;

var POINTS_PER_ROUND = 1;

var DUST_RADIUS = 4;
var DUST_BUFFER = 10;

var COIN_RADIUS = 10;
var NUM_COINS = 0;

var NUM_OBSTACLES = 1;
var current_obstacles = NUM_OBSTACLES;
var copter;
var dy = 0;
var clicking = false;

var points = 0;
var score; // text you see on the screen

var obstacles = [];
var top_terrain = [];
var bottom_terrain = [];
var whole_terrain = [];
var dust = [];
var coins = [];

var coinSound = new Audio("https://raw.githubusercontent.com/JLW-7/Helicopter-Game-In-Javascript/main/coin_sound.mp3");
var gameOverSound = new Audio("https://raw.githubusercontent.com/JLW-7/Helicopter-Game-In-Javascript/main/hit_obstacle_sound.mp3");
var bgMusic = new Audio("https://raw.githubusercontent.com/JLW-7/Helicopter-Game-In-Javascript/main/game_bgm.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.2;


function start() {
    setup();
    bgMusic.play();
    setTimer(game, DELAY);
    mouseDownMethod(onMouseDown);
    mouseUpMethod(onMouseUp);
    setBackgroundColor(Color.black); 
}



function setup() {
    setBackgroundColor(Color.black);
    copter = new WebImage(ImageLibrary.Objects.helicopter);
    copter.setSize(50, 25);
    copter.setPosition(getWidth() / 3, getHeight() / 2);
    add(copter);
    
    addObstacle();
    addTerrain();
    score = new Text("0");
    score.setColor(Color.white);
    score.setPosition(10, 30);
    add(score);
    
}



function updateScore() {
    points += POINTS_PER_ROUND;
    score.setText(points);
}

function game() {
    updateScore();
    
    if (points >= 99 && points <= 130) {
        NUM_COINS = 1;
    }
    
    if (points >= 899 && points <= 630) {
        NUM_OBSTACLES = 2;
    }
    
    if (points >= 1099 && points <= 1130) {
        NUM_COINS = 2;
    }
   
    if (NUM_OBSTACLES > current_obstacles) {
        for (var i = current_obstacles; i < NUM_OBSTACLES; i++) {
            var obstacleL = Randomizer.nextInt(140, 170);
            var obstacleW = 35;
            
            var obstacle = new Rectangle(obstacleW, obstacleL);
            obstacle.setColor(Color.green);
        
            var obstacleX = getWidth() + 205;
            var obstacleY = Randomizer.nextInt(0, getHeight() - 200);
        
            obstacle.setPosition(obstacleX + i * (getWidth() / NUM_OBSTACLES), obstacleY);
            obstacles.push(obstacle);
            add(obstacle);
        }
        current_obstacles = NUM_OBSTACLES;
    }
    
    if (hitWall()) {
        lose();
        return;
    }
    
    var collider = getCollider();
    if (collider == "obstacle") {
        lose();
        return;
    }
    
    if (collider && coins.includes(collider)) {
        collectCoins(collider); // Pass the specific coin
        return;
    }
    
    if (clicking) {
        dy -= 1;
        if (dy > -MAX_DY) {
            dy = -MAX_DY;
        }
    } else {
        dy += 1;
        if (dy > MAX_DY) {
            dy = MAX_DY;
        }
    }
    
    copter.move(0, dy);
    moveObstacle();
    moveTerrain();
    moveDust();
    addDust();
    addCoins();
    moveCoins();
}


function onMouseDown(e) {
    clicking = true;
}

function onMouseUp(e) {
    clicking = false;
}



function addObstacle() {
    for (var i = 0; i < NUM_OBSTACLES; i++) {
        var obstacleL = Randomizer.nextInt(140, 170);
        var obstacleW = 35;
        
        var obstacle = new Rectangle(obstacleW, obstacleL);
        obstacle.setColor(Color.green);
    
        var obstacleX = getWidth();
        var obstacleY = Randomizer.nextInt(0, getHeight() - 200);
    
        obstacle.setPosition(obstacleX + i * (getWidth() / NUM_OBSTACLES), obstacleY);
        obstacles.push(obstacle);
        add(obstacle);
    }
}

function moveObstacle() {
    for (var i = 0; i < obstacles.length; i++) {
        var obstacle = obstacles[i];
        obstacle.move(-OBSTACLE_SPEED, 0);
        if (obstacle.getX() < 0) {
            obstacle.setPosition(
                getWidth(),
                Randomizer.nextInt(0, getHeight() - 40));
        }
    }
}

function hitWall() {
    var hit_top = copter.getY() < 0;
    var hit_bottom = copter.getY() + copter.getHeight() > getHeight();
    return hit_top || hit_bottom;
}

function lose() {
    bgMusic.pause();
    stopTimer(game);
    var lose_box = new Rectangle(getWidth() + 100, getHeight() + 100);
    lose_box.setColor(Color.black);
    lose_box.setPosition(getWidth() / 2 - lose_box.getWidth() / 2,
                         getHeight() / 2 - lose_box.getHeight() / 2 - 20);
    add(lose_box);
    var lose_text = new Text("Game Over...", "40pt Impact");
    lose_text.setColor(Color.white);
    lose_text.setPosition(getWidth() / 2 - lose_text.getWidth() / 2,
                          getHeight() / 2);
    add(lose_text);
    // var respawn_box = new Rectangle(200, 50);
    // respawn_box.setColor(Color.white);
    // respawn_box.setPosition(getWidth() / 2 - respawn_box.getWidth() / 2 + 5,
    //                       getHeight() / 2 + 75);
    // add(respawn_box);
    var respawn_text = new Text("Click here to replay.", "14pt Andale Mono");
    respawn_text.setColor(Color.white);
    respawn_text.setPosition(getWidth() / 2 - respawn_text.getWidth() / 2 + 5,
                           getHeight() / 2 + 90);
    add(respawn_text);
    var score_text = new Text(points, "18pt Andale Mono");
    score_text.setColor(Color.white);
    score_text.setPosition(getWidth() / 2 - score_text.getWidth() / 2 + 80,
                           getHeight() / 2 + 50);
    add(score_text);
    var score_text2 = new Text("YOUR SCORE:", "18pt Andale Mono");
    score_text2.setColor(Color.white);
    score_text2.setPosition(getWidth() / 2 - score_text2.getWidth() / 2 - 35,
                           getHeight() / 2 + 50);
    add(score_text2);
}

function getCollider() {
    var topLeft = getElementAt(copter.getX() - 1, copter.getY() - 1);
    var topRight = getElementAt(copter.getX() + copter.getWidth() + 1, copter.getY() - 1);
    var bottomLeft = getElementAt(copter.getX() - 1, copter.getY() + copter.getHeight() + 1);
    var bottomRight = getElementAt(copter.getX() + copter.getWidth() + 1, copter.getY() + copter.getHeight() + 1);

    var colliders = [topLeft, topRight, bottomLeft, bottomRight];

    for (var i = 0; i < colliders.length; i++) {
        var collider = colliders[i];

        if (collider != null) {
            if (obstacles.includes(collider) || whole_terrain.includes(collider)) {
                gameOverSound.play();
                return "obstacle";
            }
            if (coins.includes(collider)) {
                return collider; // Return the specific coin
            }
        }
    }
    return null;
}


function addTerrain() {
    for (var i = 0; i < getWidth() / TW; i++) {
        var height = Randomizer.nextInt(MIN_TH, MAX_TH);
        var topTerrain = new Rectangle(TW, height);
        topTerrain.setPosition(TW * i, 0)
        topTerrain.setColor(Color.green);
        top_terrain.push(topTerrain);
        add(topTerrain);
        
        var bottomTerrain = new Rectangle(TW, height);
        var btHeight = bottomTerrain.getHeight()
        bottomTerrain.setPosition(TW * i, getHeight() - btHeight);
        bottomTerrain.setColor(Color.green);
        bottom_terrain.push(bottomTerrain);
        add(bottomTerrain);
        
        whole_terrain = top_terrain.concat(bottom_terrain);
    }
}

function moveTerrain() {
    for (var i = 0; i < top_terrain.length; i++) {
        var obj = top_terrain[i];
        obj.move(-TS, 0);
        if (obj.getX() + obj.getWidth() < 0) {
            obj.setPosition(getWidth() - 15, obj.getY());
        }
    }
    for (var i = 0; i < bottom_terrain.length; i++) {
        var obj2 = bottom_terrain[i];
        obj2.move(-TS, 0);
        if (obj2.getX() + obj2.getWidth() < 0) {
            obj2.setPosition(getWidth() - 15, obj2.getY());
        }
    }
}


function addDust() {
    var d = new Circle(DUST_RADIUS);
    d.setColor("#cccccc");
    d.setPosition(copter.getX() - d.getWidth(), 
                  copter.getY() + DUST_BUFFER);
    dust.push(d);
    add(d);
}

function moveDust() {
    for (var i = 0; i < dust.length; i++) {
        var d = dust[i];
        d.move(-SPEED, 0);
        d.setRadius(d.getRadius() - 0.2);
        if (d.getX() < 0) {
            remove(d);
            dust.remove(i);
            i--
        }
    }
}

function addCoins() {
    while (coins.length < NUM_COINS) {
        var coin = new WebImage("https://raw.githubusercontent.com/JLW-7/Helicopter-Game-In-Javascript/refs/heads/main/coin_image.png");
        coin.setSize(15, 15);

        
        var coinX = Randomizer.nextInt(getWidth() - 50, getWidth());
        var coinY = Randomizer.nextInt(50, getHeight() - 50);

        // Ensure no overlap with obstacles, terrain, or other coins
        if (CoinNotOnElement(coinX, coinY, coin)) {
            coin.setPosition(coinX, coinY);
            coins.push(coin);
            add(coin);
        }
    }
}


function CoinNotOnElement(coinX, coinY, coin) {
    var coinWidth = coin.getWidth();
    var coinHeight = coin.getHeight();

    // Step size for finer collision checks
    var step = 5;

    // Iterate through the coin's bounding box
    for (var x = coinX; x <= coinX + coinWidth; x += step) {
        for (var y = coinY; y <= coinY + coinHeight; y += step) {
            var element = getElementAt(x, y);
            if (element && (obstacles.includes(element) || whole_terrain.includes(element) || coins.includes(element))) {
                // Coin overlaps with an obstacle or terrain
                return false;
            }
        }
    }

    // No overlap detected
    return true;
}






function moveCoins() {
    for (var i = 0; i < coins.length; i++) {
        var coin = coins[i];
        coin.move(-COIN_SPEED, 0);

        // If the coin moves off-screen, remove it from the game and from the coins array
        if (coin.getX() < 0) {
            remove(coin);
            coins.splice(i, 1);
            i--; // Adjust index after removing an item
        }
    }
}

function collectCoins(coin) {
    points += 50; // Award points for collecting the coin
    coinSound.play();
    remove(coin); // Remove the coin from the screen
    coins.splice(coins.indexOf(coin), 1); // Remove the coin from the array
    showZoomingText("+50", coin.getX(), coin.getY(), 500); 
}


function showZoomingText(text, x, y, duration) {
    var zoomText = new Text(text, "20pt Arial"); // Initial font size
    zoomText.setColor(Color.yellow);
    zoomText.setPosition(x, y);
    add(zoomText);

    var fontSize = 20; // Starting font size
    var maxFontSize = 30; // Max font size for zoom-in
    var zoomSpeed = 2; // Speed of zooming (change in font size per frame)
    var fadeDelay = duration / (maxFontSize - fontSize); // Delay per frame

    // Timer for zoom-in effect
    var zoomTimer = setTimer(function () {
        if (fontSize < maxFontSize) {
            fontSize += zoomSpeed;
            zoomText.setFont(fontSize + "pt Arial");
            zoomText.setPosition(x - zoomText.getWidth() / 2, y - zoomText.getHeight() / 2);
        } else {
            stopTimer(zoomTimer);
            remove(zoomText); // Remove the text after zoom-in completes
        }
    }, fadeDelay);
}
