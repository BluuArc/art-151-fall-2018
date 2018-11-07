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
      body.onkeyup = e => {
        if (e.key === 'r' || e.key === ' ') {
          this._gameState.keysPressed.restart = true;
        } else if (e.key === 'h') {
          this._gameState.keysPressed.toggleHitbox = true;
        } else if (e.key === 'p') {
          this._gameState.keysPressed.pause = true;
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
      player.speed -= keysPressed.speedUpTurn ? 4 : 2;
    } else if (keysPressed.right) {
      player.speed += keysPressed.speedUpTurn ? 4 : 2;
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
    if (position.x < 0) {
      position.x = 0;
    } else if (position.x + frame.size.x * 1.5 > canvas.width) {
      position.x = canvas.width - frame.size.x * 1.5;
    }

    // draw
    console.debug('drawing player');
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
}
