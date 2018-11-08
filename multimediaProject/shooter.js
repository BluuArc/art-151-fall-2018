class SpaceShooter {
  constructor (width = 720, height = 400, doAutoLoop = true) {
    this._canvas = document.createElement('canvas');
    this._canvas.width = width;
    this._canvas.height = height;
    // this._canvas.style.display = 'none';

    const canvasOptions = {
      uiOffset: 20,
      showHitBoxes: false,
      backgroundColor: 'black',
    };
    this._canvasOptions = canvasOptions;

    const gameActions = {
      pause: () => this.pause(),
      restart: () => this.restart(),
    };

    const gameState = {
      score: 0,
      lives: 2, // remaining
      player: {
        speed: {
          x: 0,
          max: 10,
        },
        frame: {
          current: 0,
          sinceUpdate: 0,
          number: 3,
          size: { //mult by 2 since canvas copy was scaled
            x: 14 * 2,
            y: 15 * 2,
          },
        },
        position: {
          x: this._canvas.width / 2,
          y: this._canvas.height - 50,
        },
      },
      starLocations: [],
      enemies: [],
      allies: [],
      keysPressed: {
        left: false,
        right: false, 
        up: false,
        speedUpTurn: false,
        set pause (newValue) {
          if (newValue) {
            gameActions.pause();
          }
        },
        set restart (newValue) {
          if (newValue && !gameState.isPlaying) {
            gameActions.restart(gameState.lives < 0);
          }
        },
        set toggleHitbox (newValue) {
          if (newValue) {
            canvasOptions.showHitBoxes = !canvasOptions.showHitBoxes;
          }
        },
      },
      isPlaying: true,
      isPaused: false,
      doAutoLoop: !!doAutoLoop, // defines whether to play on its own or have something else control when to draw
      lastEnemyAdd: 0,
      maxAllies: parseInt(Math.random() * 10 + 1),
      maxEnemies: parseInt(Math.random() * 5 + 1),
    };
    this._gameState = gameState;

    this._assetsContainer = document.getElementById('assets');
    this._assetConfig = {
      mainSheet: {
        dom: this._assetsContainer.querySelector('img#mainSheet'),
      },
      player: {},
      enemy: {},
      life: {},
      scoreDrop: {},
    };

    this._raf = null; // requestAnimationFrame reference

    this._initializeSprites();

    // keyboard listeners
    if (doAutoLoop) {
      const body = document.body;
      const { keysPressed } = this._gameState;
      body.onkeydown = e => {
        if (e.key === 'ArrowUp') {
          keysPressed.up = true;
        } else if (e.key === 'ArrowLeft') {
          keysPressed.left = true;
        } else if (e.key === 'ArrowRight') {
          keysPressed.right = true;
        }
      };
      body.onkeyup = e => {
        if (e.key === 'r' || e.key === ' ') {
          keysPressed.restart = true;
        } else if (e.key === 'h') {
          keysPressed.toggleHitbox = true;
        } else if (e.key === 'p') {
          keysPressed.pause = true;
        } else if (e.key === 'ArrowUp') {
          keysPressed.up = false;
        } else if (e.key === 'ArrowLeft') {
          keysPressed.left = false;
        } else if (e.key === 'ArrowRight') {
          keysPressed.right = false;
        }
      };
    }
  }

  getAsset (type, name, frameNumber) {
    if (!Object.keys(this._assetConfig).includes(type)) {
      throw new Error(`Unknown type "${type}". Supported types: ${Object.keys(this._assetConfig).join(', ')}`);
    }

    return this._assetsContainer.querySelector(`#${type}${name}${frameNumber}`);
  }

  _createFrames (frameInfo = {}, sizeX = 0, sizeY = 0, assetLabel) {
    const sheet = this._assetConfig.mainSheet.dom;
    const assetsGroup = this._assetsContainer;

    Object.keys(frameInfo).forEach(type => {
      const positionData = frameInfo[type];
      positionData.forEach((frame, i) => {
        const id = `${type}${i}`;

        // initialize canvas
        const frameCanvas = document.createElement('canvas');
        frameCanvas.id = `${assetLabel}${id}`;
        frameCanvas.style.height = `${sizeY * 2}px`;
        frameCanvas.width = sizeX * 2; // scale up to be more visible
        frameCanvas.height = sizeY * 2;
        assetsGroup.appendChild(frameCanvas);

        // draw frame on canvas
        const frameContext = frameCanvas.getContext('2d');
        if (frame.flip) {
          // flip code based on https://stackoverflow.com/a/3129152/8530126
          frameContext.save();
          frameContext.translate(frameCanvas.width, 0);
          frameContext.scale(-1, 1);
          frameContext.drawImage(
            sheet, // source
            frame.x, frame.y, // source x, y
            sizeX, sizeY, // source dimensions
            0, 0, // target x, y
            frameCanvas.width, frameCanvas.height, // target dimensions
          );
          frameContext.restore();
        } else {
          frameContext.drawImage(
            sheet, // source
            frame.x, frame.y, // source x, y
            sizeX, sizeY, // source dimensions
            0, 0, // target x, y
            frameCanvas.width, frameCanvas.height, // target dimensions
          );
        }
      });
    });
  }

  _initializeSprites () {
    //coords are top left of each frame
    const playerFrames = {
      idle: [{x: 52, y: 1}, {x: 69, y: 1}, {x: 86, y:1}],
      turn1L: [{x: 52, y: 18}, {x: 69, y: 18}, {x: 86, y:18}],
      turn1R: [{x: 52, y: 18, flip: true}, {x: 69, y: 18, flip: true}, {x: 86, y:18, flip: true}],
      turn2L: [{x: 52, y: 35}, {x: 69, y: 35}, {x: 86, y:35}],
      turn2R: [{x: 52, y: 35,flip: true}, {x: 69, y: 35, flip: true}, {x: 86, y:35, flip: true}],
    };
    
    const enemyFrames = {
      idle: [{x: 129, y: 34}],
      turn1R: [{x: 114, y: 34}],
      turn1L: [{x: 114, y: 34, flip: true}],
      turn2R: [{x: 101, y: 34}],
      turn2L: [{x: 101, y: 34, flip: true}],
    };
    
    const lifeSprite = {
      life: [{x: 0, y: 90}]
    };
    
    const scoreSprite = {
      drop10: [{x: 0, y: 66}]
    };

    this._createFrames(playerFrames, 14, 15, 'player');
    this._assetConfig.player.names = Object.keys(playerFrames);

    this._createFrames(enemyFrames, 14, 15, 'enemy');
    this._assetConfig.enemy.names = Object.keys(enemyFrames);

    this._createFrames(lifeSprite, 8, 8, 'life');
    this._assetConfig.life.names = Object.keys(lifeSprite);

    this._createFrames(scoreSprite, 8, 6, 'scoreDrop');
    this._assetConfig.scoreDrop.names = Object.keys(scoreSprite);
  }

  get canvas () {
    return this._canvas;
  }

  get canvasContext () {
    return this.canvas.getContext('2d');
  }

  get canvasAndContext () {
    return {
      canvas: this.canvas,
      context: this.canvasContext,
    };
  }

  _movePlayer () {
    const { keysPressed, player } = this._gameState;
    const max = player.speed.max * (keysPressed.speedUpTurn ? 1.5 : 1);

    if (keysPressed.left) {
      player.speed.x -= keysPressed.speedUpTurn ? 4 : 2;
    } else if (keysPressed.right) {
      player.speed.x += keysPressed.speedUpTurn ? 4 : 2;
    } else { // decelerate
      if (player.speed.x < 0) {
        player.speed.x += 1;
      } else if (player.speed.x > 0) {
        player.speed.x -= 1;
      }
    }

    // make sure speed doesn't exceed max
    if (player.speed.x < -max) {
      player.speed.x = -max;
    } else if (player.speed.x > max) {
      player.speed.x = max;
    }
  }

  _drawPlayer () {
    const { speed, position, frame } = this._gameState.player;
    const { canvas, context } = this.canvasAndContext;
    let assetLabel;
    if (speed.x === 0) {
      assetLabel = 'idle';
    } else if (speed.x > 0) {
      assetLabel = speed.x < speed.max / 2  ? 'turn1R' : 'turn2R';
    } else {
      assetLabel = speed.x < -speed.max / 2 ? 'turn1L' : 'turn2L';
    }
    const sprite = this.getAsset('player', assetLabel, frame.current);

    // update position
    position.x += speed.x;

    // reached left/right edge, so teleport to other side
    if (position.x < 0) {
      position.x = canvas.width - frame.size.x * 1.5;
    } else if (position.x + frame.size.x * 1.5 > canvas.width) {
      position.x = 0;
    }

    // draw
    // console.debug('drawing player', position.x, position.y);
    context.drawImage(sprite, position.x, position.y);

    // update counters
    frame.current++;
    frame.sinceUpdate++;
    if (frame.current >= frame.number) {
      frame.current = 0;
    }
  }

  pause () {
    if (this._gameState.isPlaying) {
      this._gameState.isPaused = !this._gameState.isPaused;
    }

    if (this._gameState.isPaused) {
      const { canvas, context } = this.canvasAndContext;

      context.fillStyle = 'blue';
      context.font = '75px bold Arial';
      context.textAlign = 'center';
      context.fillText('GAME PAUSED', canvas.width / 2, canvas.height / 2);

      context.font = '30px bold Arial';
      context.fillText('Press p to unpause', canvas.width / 2, canvas.height / 2 + 30);
      if (this._raf) {
        cancelAnimationFrame(this._raf);
      }
    } else if (this._gameState.doAutoLoop) {
      this._raf = requestAnimationFrame(() => this.draw());
    }
  }

  restart (fullRestart = false) {
    if (fullRestart) {
      this._gameState.lives = 2;
      this._gameState.score = 0;
    }

    this._gameState.enemies = [];
    this._gameState.allies = [];
    this._gameState.starLocations = [];
    this._gameState.isPaused = false;
    this._gameState.lastEnemyAdd = 0;

    this._gameState.player.position.x = this.canvas.width / 2;
    this._gameState.player.speed.x = 0;
    this._gameState.maxEnemies = parseInt(Math.random() * 5 + 1);
    this._gameState.maxAllies = parseInt(Math.random() * 5 + 1);

    this._gameState.isPlaying = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }

    this._gameState.isPlaying = true;
    this.draw();
  }

  draw () {
    const { canvas, context } = this.canvasAndContext;

    // game over
    if (!this._gameState.isPlaying) {
      this._gameState.lives--;
      if (this._gameState.lives < 0) {
        context.fillStyle = 'red';
        context.font = "75px bold Arial";
        context.textAlign = "center";
        context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        context.font = "30px bold Arial";
        context.fillText("Press 'r' to restart", canvas.width / 2, canvas.height / 2 + 30);
      }
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    this._drawBackground();

    this._drawGameEntities();

    this._drawGameUi();

    this._randomlyGenerateEnemyAndAlly();

    const hasEnemyCollision = this._checkCollisions();

    if (hasEnemyCollision) {
      this._gameState.isPlaying = false;

      if (this._gameState.lives > 0) {
        context.fillStyle = 'red';
        context.font = "30px bold Arial";
        context.textAlign = "center";
        context.fillText("You hit another ship!", canvas.width / 2, canvas.height / 2);

        context.font = "20px bold Arial";
        context.fillText("Press Space to continue", canvas.width / 2, canvas.height / 2 + 30);
      }
    }

    if (this._gameState.doAutoLoop && !this._gameState.isPaused) {
      this._raf = requestAnimationFrame(() => this.draw());
    }
  }

  _drawBackground () {
    const { canvas, context } = this.canvasAndContext;
    context.fillStyle = this._canvasOptions.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // randomly add a star
    if (this._gameState.starLocations.length < Math.max(this._gameState.maxAllies, this._gameState.maxEnemies) * 2 &&
      Math.random() < 0.1) {
        this._gameState.starLocations.push([Math.random() * canvas.width, 0]);
        // console.debug(this._gameState.starLocations, canvas.height);
    }

    // filter, draw, and update locations
    // gradient based off of https://www.w3schools.com/tags/canvas_createlineargradient.asp
    const starGradient = context.createLinearGradient(0, 0, 0, 150);
    starGradient.addColorStop(0, 'black');
    starGradient.addColorStop(1, 'white');
    context.fillStyle = starGradient;
    this._gameState.starLocations = this._gameState.starLocations.map(([x, y]) => {
      // draw and update position
      context.fillRect(x, y, 5, this._gameState.keysPressed.up ? 20 : 10);
      return (y >= canvas.height) ? ([Math.random() * canvas.width, 0]) : [x, y + (this._gameState.keysPressed.up ? 10 : 7)];
    });
  }

  _drawGameEntities () {
    this._movePlayer();
    this._drawPlayer();

    this._gameState.enemies.forEach(enemy => {
      this._moveEnemy(enemy);
      this._drawEnemy(enemy);
    })

    this._gameState.allies.forEach(scoreDrop => {
      this._moveScoreDrop(scoreDrop);
      this._drawScoreDrop(scoreDrop);
    });
  }

  _drawGameUi () {
    const { canvas, context } = this.canvasAndContext;
    const textY = this._canvasOptions.uiOffset * 0.6;
    context.textAlign = 'start';

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, this._canvasOptions.uiOffset);

    context.font = "15px bold Consolas";
    context.fillStyle = 'white';
    context.fillText("Score: " + this._gameState.score, 5, textY);

    context.fillText("Remaining Lives:", canvas.width - 165, textY);

    // draw lives
    let startX = canvas.width - 50;
    const startY = 0;
    for (let i = 0; i < this._gameState.lives; ++i) {
      context.drawImage(this.getAsset('life', 'life', 0), startX, startY);
      startX += 25;
    }
  }

  _randomlyGenerateEnemyAndAlly () {
    if (
      (this._gameState.enemies.length < this._gameState.maxEnemies && Math.random() < 0.1) ||
      (this._gameState.lastEnemyAdd > 1000 && Math.random() < 0.05)
    ) {
      this.addEnemy();
      this._gameState.lastEnemyAdd = 0;
    } else {
      this._gameState.lastEnemyAdd++;
    }

    if (
      (this._gameState.allies.length < this._gameState.maxAllies && Math.random() < 0.1) ||
      (this._gameState.lastEnemyAdd > 1000 && Math.random() < 0.05)
    ) {
      this.addScoreDrop();
      this._gameState.lastEnemyAdd = 0;
    } else {
      this._gameState.lastEnemyAdd++;
    }
  }

  addEnemy () {
    const enemy = {
      speed: {
        x: 1,
        y: 5,
        max: parseInt(Math.random() * 10 + 5),
        min: parseInt(Math.random() * 5 + 3),
        isMovingRight: false,
        isWaiting: false,
      },
      frame: {
        current: 0,
        sinceUpdate: 0,
        number: 1,
        sinceUpdateMax: 30,
        size: { //mult by 2 since canvas copy was scaled
          x: 14 * 2,
          y: 15 * 2
        },
      },
      position: {
        x: parseInt(Math.random() * this.canvas.width),
        y: 0,
      },
    };
    this._gameState.enemies.push(enemy);
  }

  _moveEnemy (enemy = {}) {
    const { speed, frame } = enemy;
    const { min, max } = speed;
    const { keysPressed } = this._gameState;

    if (keysPressed.up) {
      speed.y += keysPressed.speedUpTurn ? 4 : 2;
    } else { // decelerate
      speed.y = Math.max(speed.y - 1, min);
    }

    // move in a zig-zag motion
    if (speed.x > max) {
      speed.x = max - 1;
      speed.isMovingRight = false;
      speed.isWaiting = true;
      frame.sinceUpdateMax = Math.ceil(Math.random() * 51);
    } else if (speed.x < -max) {
      speed.x = -max + 1;
      speed.isMovingRight = true;
      speed.isWaiting = true;
      frame.sinceUpdateMax = Math.ceil(Math.random() * 51);
    } else if (speed.x === 0 && speed.isWaiting) {
      // wait a number of frames before moving
      if (frame.sinceUpdate > frame.sinceUpdateMax) {
        frame.sinceUpdate = 0;
        speed.isWaiting = false;
      }
    } else {
      speed.x = Math.round(speed.x) + (speed.isMovingRight ? 1 : -1);
    }

    // bounds check
    speed.y = Math.min(Math.max(speed.y, min), max);
  }

  _drawEnemy (enemy = {}) {
    const { speed, position, frame } = enemy;
    const { canvas, context } = this.canvasAndContext;
    let assetLabel;
    if (speed.x === 0) {
      assetLabel = 'idle';
    } else if (speed.x > 0) {
      assetLabel = speed.x < speed.max / 2  ? 'turn1R' : 'turn2R';
    } else {
      assetLabel = speed.x < -speed.max / 2 ? 'turn1L' : 'turn2L';
    }
    const sprite = this.getAsset('enemy', assetLabel, frame.current);

    // update position
    position.x += speed.x;
    position.y += speed.y;

    // reached left/right edge, so teleport to other side
    if (position.x < 0) {
      position.x = canvas.width - frame.size.x * 1.5;
    } else if (position.x + frame.size.x * 1.5 > canvas.width) {
      position.x = 0;
    }

    // reached bottom, so start at top
    if (position.y > canvas.height - frame.size.y) {
      position.y = -frame.size.y * Math.round(Math.random() * 5 + 1);
      position.x = Math.round(Math.random() * canvas.width);
      speed.max = Math.round(Math.random() * 20 + 5);
    }

    // draw
    context.drawImage(sprite, position.x, position.y);

    // update counters
    frame.current++;
    frame.sinceUpdate++;
    if (frame.current >= frame.number) {
      frame.current = 0;
    }
  }

  addScoreDrop () {
    const scoreDrop = {
      speed: {
        x: 0,
        y: 2,
        max: 10,
        min: 5,
      },
      frame: {
        current: 0,
        sinceUpdate: 0,
        number: 1,
        sinceUpdateMax: 30,
        size: { //mult by 2 since canvas copy was scaled
          x: 8 * 2,
          y: 6 * 2
        },
      },
      position: {
        x: parseInt(Math.random() * this.canvas.width),
        y: 0,
      },
      isActive: true,
    };
    this._gameState.allies.push(scoreDrop);
  }

  _moveScoreDrop (scoreDrop = {}) {
    const { speed } = scoreDrop;
    const { max, min } = speed;
    const { keysPressed } = this._gameState;

    if (keysPressed.up) {
      speed.y += keysPressed.speedUpTurn ? 4 : 2;
    } else { // decelerate
      speed.y = Math.max(speed.y - 1, min);
    }

    // bounds check
    speed.y = Math.min(Math.max(speed.y, min), max);
  }

  _drawScoreDrop (enemy = {}) {
    const { speed, position, frame } = enemy;
    const { canvas, context } = this.canvasAndContext;
    const sprite = this.getAsset('scoreDrop', 'drop10', frame.current);

    // update position
    position.x += speed.x;
    position.y += speed.y;

    // reached left/right edge, so teleport to other side
    if (position.x < 0) {
      position.x = canvas.width - frame.size.x * 1.5;
    } else if (position.x + frame.size.x * 1.5 > canvas.width) {
      position.x = 0;
    }

    // reached bottom, so start at top
    if (position.y > canvas.height - frame.size.y) {
      position.y = -frame.size.y * 2;
      position.x = Math.round(Math.random() * canvas.width);
    }

    // draw
    context.drawImage(sprite, position.x, position.y);

    // update counters
    frame.current++;
    frame.sinceUpdate++;
    if (frame.current >= frame.number) {
      frame.current = 0;
    }
  }

  _checkCollisions () {
    const hasEnemyCollision = this._gameState.enemies.some(enemy => this._isColliding(this._gameState.player, enemy));

    this._gameState.allies = this._gameState.allies.filter(scoreDrop => {
      const isColliding = this._isColliding(this._gameState.player, scoreDrop);
      if (isColliding) {
        this._gameState.score += 10;
      }
      return !isColliding;
    });
    return hasEnemyCollision;
  }

  _isColliding (e1, e2) {
    const e1Bounds = {
      x: [e1.position.x, e1.position.x + e1.frame.size.x],
      y: [e1.position.y, e1.position.y + e1.frame.size.y],
    };
    const e2Bounds = {
      x: [e2.position.x, e2.position.x + e2.frame.size.x],
      y: [e2.position.y, e2.position.y + e2.frame.size.y],
    };

    if (this._canvasOptions.showHitBoxes) {
      const context = this.canvasContext;
      context.strokeStyle = ' white';
      context.strokeRect(e1Bounds.x[0], e1Bounds.y[0], e1.frame.size.x, e2.frame.size.y);
      context.strokeRect(e2Bounds.x[0], e2Bounds.y[0], e2.frame.size.x, e2.frame.size.y);
    }

    //check if any edge of e1 is within range of bounds for e2
    const leftCollide = (e1Bounds.x[0] > e2Bounds.x[0] && e1Bounds.x[0] < e2Bounds.x[1]);
    const rightCollide = (e1Bounds.x[1] > e2Bounds.x[0] && e1Bounds.x[1] < e2Bounds.x[1]);
    const topCollide = (e1Bounds.y[0] > e2Bounds.y[0] && e1Bounds.y[0] < e2Bounds.y[1]);
    const bottomCollide = (e1Bounds.y[1] > e2Bounds.y[0] && e1Bounds.y[1] < e2Bounds.y[1]);
    return (leftCollide || rightCollide) && (topCollide || bottomCollide);
  }
}
