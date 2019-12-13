let healthBar = document.querySelector("#health progress");
let weaponBar = document.querySelector("#weapon progress");
let citizenBar = document.querySelector("#citizen progress");
let moneyAmount = document.querySelector("#money span");

const width = 1000;
const height = 600;

let [playerStartX, playerStartY] = [30, 550];
let [enemy1x, enemy1y, enemy2x, enemy2y] = [600, 20, 800, 200];
let [money1x, money1y, money2x, money2y] = [900, 200, 700, 100];

let [hospitalWall, hospitalRoof, hospitalWidth, hospitalHeight] = [
  0,
  0,
  250,
  250
];
let [bankWall, bankRoof, bankWidth, bankHeight] = [480, 0, 520, 250];
let [armoryWall, armoryRoof, armoryWidth, armoryHeight] = [480, 450, 520, 150];
let [sidewalk, curb] = [10, 30];

function preload() {
  bankLogo = loadImage("https://i.imgur.com/31ynffh.png");
  hospitalLogo = loadImage("https://i.imgur.com/VnI3KoD.png");
  bombLogo = loadImage("https://i.imgur.com/kvoZS7Y.png");
  playerSprite = loadImage("https://i.imgur.com/8PDfSBd.png");
  enemySprite = loadImage("https://i.imgur.com/MyyVCRq.png");
  moneySprite = loadImage("https://i.imgur.com/p7WOpvy.png");
  citizenSprite = loadImage("https://i.imgur.com/Tvt9CXL.png?2");
  policeCarHorizontalSprite = loadImage("https://i.imgur.com/PEG9ncj.png?1");
  policeCarVerticalSprite = loadImage("https://i.imgur.com/DyVuQt3.png?1");
}

let arrow = { left: 37, up: 38, right: 39, down: 40 };
let attackKey = 32;
let citizenKey = 16;
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let attackKeyPressed = false;
let citizenKeyPressed = false;

function keyDownHandler(event) {
  if (event.keyCode === arrow.right) {
    rightPressed = true;
  } else if (event.keyCode === arrow.left) {
    leftPressed = true;
  }
  if (event.keyCode === arrow.down) {
    downPressed = true;
  } else if (event.keyCode === arrow.up) {
    upPressed = true;
  }
  if (event.keyCode === attackKey) {
    attackKeyPressed = true;
  }
  if (event.keyCode === citizenKey) {
    citizenKeyPressed = true;
  }
}

function keyUpHandler(event) {
  if (event.keyCode === arrow.right) {
    rightPressed = false;
  } else if (event.keyCode === arrow.left) {
    leftPressed = false;
  }
  if (event.keyCode === arrow.down) {
    downPressed = false;
  } else if (event.keyCode === arrow.up) {
    upPressed = false;
  }
  if (event.keyCode === attackKey) {
    attackKeyPressed = false;
  }
  if (event.keyCode === citizenKey) {
    citizenKeyPressed = false;
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function loadWeaponBar() {
  if (player.x > armoryWall && player.y > armoryRoof && weaponBar.value < 100) {
    weaponBar.value += 0.5;
  }
}

function loadCitizenBar() {
  if (citizenBar.value < 100) {
    citizenBar.value += 0.1;
  }
}

class Player {
  constructor(x, y) {
    this.diameter = 20;
    this.color = "white";
    this.health = 100;
    this.size = { width: 70, height: 70 };
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.money = 0;
  }
  render() {
    fill("white");
    image(
      playerSprite,
      this.x - this.size.width / 2,
      this.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );
  }
  move() {
    if (rightPressed) {
      this.x += this.speed;
    } else if (leftPressed) {
      this.x -= this.speed;
    }
    if (downPressed) {
      this.y += this.speed;
    } else if (upPressed) {
      this.y -= this.speed;
    }
  }
  bounds() {
    let rightBorder = width;
    let leftBorder = width - width;
    let bottomBorder = height;
    let topBorder = height - height;
    if (this.x < leftBorder) {
      this.x = leftBorder;
    }
    if (this.x > rightBorder) {
      this.x = rightBorder;
    }
    if (this.y > bottomBorder) {
      this.y = bottomBorder;
    }
    if (this.y < topBorder) {
      this.y = topBorder;
    }
  }
  takeHit() {
    if (healthBar.value > 0) {
      this.health -= 2;
    }
    healthBar.value = this.health;
  }
  gainHealth() {
    this.health += 0.25;
    healthBar.value = this.health;
  }
  getMoney() {
    this.money += 50;
    moneyAmount.textContent = this.money;
    takeMoneyBag();
  }
  attack() {
    this.bomb = { x: this.x, y: this.y, diameter: 250 };
    loadWeaponBar();
    if (attackKeyPressed && weaponBar.value === 100) {
      fill("rgba(200, 50, 0, 0.5)");
      circle(this.bomb.x, this.bomb.y, this.bomb.diameter);
      weaponBar.value = 0;
      destroyNearbyEnemies();
    }
  }
  placeCitizen() {
    loadCitizenBar();
    if (citizenKeyPressed && citizenBar.value === 100) {
      citizens.unshift(new Citizen(player.x, player.y));
      citizenBar.value = 0;
      setTimeout(deleteCitizen, 5000);
    }
  }
}

function collided(object1, object2) {
  const sumOfRadii = (object1.diameter + object2.diameter) / 2;
  const distanceBetween = Math.hypot(
    object1.x - object2.x,
    object1.y - object2.y
  );
  return distanceBetween < sumOfRadii;
}

function deleteCitizen() {
  citizens.splice(0, 1);
}

function heal(thing) {
  return (
    thing.x < hospitalWidth &&
    thing.y < hospitalWidth &&
    healthBar.value < 100
  );
}

class Enemy {
  constructor(x, y, speed) {
    this.diameter = 30;
    this.color = "red";
    this.size = { width: 80, height: 80 };
    this.speed = speed;
    this.x = x;
    this.y = y;
  }
  render() {
    fill(this.color);
    image(
      enemySprite,
      this.x - this.size.width / 2,
      this.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );
  }
  move() {
    this.x +=
      this.speed *
      (player.x - this.x) /
      Math.hypot(player.x - this.x, player.y - this.y);
    this.y +=
      this.speed *
      (player.y - this.y) /
      Math.hypot(player.x - this.x, player.y - this.y);
  }
  chaseDecoy() {
    this.x +=
      this.speed *
      (citizen.x - this.x) /
      Math.hypot(citizen.x - this.x, citizen.y - this.y);
    this.y +=
      this.speed *
      (citizen.y - this.y) /
      Math.hypot(citizen.x - this.x, citizen.y - this.y);
  }
  return() {}
}

class policeCarVertical {
  constructor(x, y, speed) {
    this.diameter = 80;
    this.color = "red";
    this.speed = speed;
    this.x = x;
    this.y = y;
    this.size = { width: 60, height: 100 };
  }
  render() {
    fill(this.color);
    image(
      policeCarVerticalSprite,
      this.x - this.size.width / 2,
      this.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );
  }
  move() {
    if (this.y < height + 30) {
      this.y += this.speed;
    } else if (this.y > height) {
      this.y = 0;
    }
  }
}

class policeCarHorizontal {
  constructor(x, y, speed) {
    this.diameter = 80;
    this.color = "red";
    this.speed = speed;
    this.x = x;
    this.y = y;
    this.size = { width: 100, height: 60 };
  }
  render() {
    fill(this.color);
    image(
      policeCarHorizontalSprite,
      this.x - this.size.width / 2,
      this.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );
  }
  move() {
    if (this.x < width + 30) {
      this.x += this.speed;
    } else if (this.x > width) {
      this.x = 0;
    }
  }
}

class Money {
  constructor(x, y) {
    this.size = { width: 80, height: 70 };
    this.x = x;
    this.y = y;
    this.diameter = 20;
  }
  render() {
    image(
      moneySprite,
      this.x - this.size.width / 2,
      this.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );
  }
}

class Citizen {
  constructor(x, y) {
    this.size = { width: 50, height: 100 };
    this.x = x;
    this.y = y;
    this.diameter = 20;
  }
  render() {
    image(
      citizenSprite,
      this.x - this.size.width / 2,
      this.y - this.size.height / 2,
      this.size.width,
      this.size.height
    );
  }
}

function destroyNearbyEnemies() {
  enemies = enemies.filter(e => !collided(player.bomb, e));
}

function takeMoneyBag() {
  moneyBags = moneyBags.filter(m => !collided(player, m));
}

function isArrayFull(array) {
  return array.length === 1;
}

function drawStreet() {
  let [stripeWidth, stripeLength] = [7, 22];
  fill("white");
  for (let y = 10; y < height; y += 50) {
    rect(width * 0.36, y, stripeWidth, stripeLength);
  }
  for (let x = 10; x < width; x += 50) {
    rect(x, height * 0.58, stripeLength, stripeWidth);
  }
  fill("white");
  rect(width * 0.28, height * 0.4675, width * 0.17, height * 0.235);
  fill("grey");
  rect(width * 0.29, height * 0.4775, width * 0.15, height * 0.215);
}

function drawBank() {
  fill("lightgrey");
  rect(bankWall - curb, bankRoof, bankWidth + curb, bankHeight + curb);
  fill("white");
  rect(
    bankWall - sidewalk,
    bankRoof,
    bankWidth + sidewalk,
    bankHeight + sidewalk
  );
  fill("#f7e48f");
  rect(bankWall, bankRoof, bankWidth, bankHeight);
  image(bankLogo, width * 0.49, height * 0.01, 50, 50);
}

function drawArmory() {
  fill("lightgrey");
  rect(
    armoryWall - curb,
    armoryRoof - curb,
    armoryWidth + curb,
    armoryHeight + curb
  );
  fill("white");
  rect(
    armoryWall - sidewalk,
    armoryRoof - sidewalk,
    armoryWidth + sidewalk,
    armoryHeight + sidewalk
  );
  fill("pink");
  rect(armoryWall, armoryRoof, armoryWidth, armoryHeight);
  image(bombLogo, width * 0.46, height * 0.75, 90, 60);
}

function drawFountain() {
  fill("lightgrey");
  circle(width * 0.15, height * 0.82, 120);
  fill("white");
  circle(width * 0.15, height * 0.82, 100);
  fill("#68c3ed");
  circle(width * 0.15, height * 0.82, 90);
}

function drawHospital() {
  fill("lightgrey");
  rect(hospitalWall, hospitalRoof, hospitalWidth + curb, hospitalHeight + curb);
  fill("white");
  rect(
    hospitalWall,
    hospitalRoof,
    hospitalWidth + sidewalk,
    hospitalHeight + sidewalk
  );
  fill("#a8eda6");
  rect(hospitalWall, hospitalRoof, hospitalWidth, hospitalHeight);
  image(hospitalLogo, 0, height * 0.01, 70, 47);
}

function gameOver() {
  fill("black");
  for (x = 0; x < width; x += 50) {
    rect(x, 0, 20, height);
  }
}

function randomSpeed() {
  return 1 + Math.random() * 2;
}
function randomPointInBank() {
  return [
    bankWall + Math.floor(Math.random() * bankWidth),
    Math.floor(Math.random() * bankHeight) + 5
  ];
}

function mouseClicked() {
  player.health = 100;
  healthBar.value = player.health;
  weaponBar.value = 0;
  citizenBar.value = 0;
  player.money = 0;
  moneyAmount.textContent = 0;
  player.x = playerStartX;
  player.y = playerStartY;
  enemies.splice(2, enemies.length);
  enemies[0].x = enemy1x;
  enemies[0].y = enemy1y;
  enemies[1].x = enemy2x;
  enemies[1].y = enemy2y;
  moneyBags.splice(2, moneyBags.length);
  moneyBags[0].x = money1x;
  moneyBags[0].y = money1y;
  moneyBags[1].x = money2x;
  moneyBags[1].y = money2y;
  loop();
}

let [copTimer, moneyBagTimer] = [6000, 3000];

function createEnemy() {
  if (enemies.length < player.money / 50 + 3) {
    enemies.unshift(new Enemy(...randomPointInBank(), randomSpeed()));
  }
}
let createEnemyTimer = setInterval(createEnemy, copTimer);

function createMoney() {
  if (moneyBags.length < 4) {
    moneyBags.unshift(new Money(...randomPointInBank()));
  }
}
let createMoneyTimer = setInterval(createMoney, moneyBagTimer);

let player = new Player(playerStartX, playerStartY);
let moneyBags = [new Money(money1x, money1y), new Money(money2x, money2y)];
let enemies = [
  new Enemy(enemy1x, enemy1y, 2.0),
  new Enemy(enemy2x, enemy2y, 1.5)
];
let citizens = [];
let policeCarsVertical = [
  new policeCarVertical(410, 200, 3.0),
  new policeCarVertical(320, 300, 2.0)
];
let policeCarsHorizontal = [
  new policeCarHorizontal(370, 310, 4.0),
  new policeCarHorizontal(200, 390, 5.0)
];

function adjustSprites() {
  const characters = [player, ...enemies];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      pushOff(characters[i], characters[j]);
    }
  }
}

function pushOff(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = (c1.diameter + c2.diameter) / 2 - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    c1.x -= adjustX;
    c1.y -= adjustY;
    c2.x += adjustX;
    c2.y += adjustY;
  }
}

function setup() {
  createCanvas(width, height);
  noStroke();
}

function draw() {
  background("grey");
  drawHospital();
  drawFountain();
  drawBank();
  drawArmory();
  drawStreet();
  player.move();
  player.bounds();
  player.render();
  player.attack();
  player.placeCitizen();
  for (citizen of citizens) {
    citizen.render();
  }
  if (heal(player)) {
    player.gainHealth();
  }
  if (player.health === 0) {
    noLoop();
    gameOver();
  }

  for (enemy of enemies) {
    if (collided(player, enemy)) {
      player.takeHit();
    }
    if (isArrayFull(citizens)) {
      enemy.chaseDecoy();
    } else {
      enemy.move();
    }
    enemy.render();
  }
  for (policeCarVertical of policeCarsVertical) {
    if (collided(player, policeCarVertical)) {
      player.takeHit();
    }
    policeCarVertical.move();
    policeCarVertical.render();
  }
  for (policeCarHorizontal of policeCarsHorizontal) {
    if (collided(player, policeCarHorizontal)) {
      player.takeHit();
    }
    policeCarHorizontal.move();
    policeCarHorizontal.render();
  }

  for (money of moneyBags) {
    if (collided(player, money)) {
      player.getMoney();
    }
    money.render();
  }
  adjustSprites();
}
