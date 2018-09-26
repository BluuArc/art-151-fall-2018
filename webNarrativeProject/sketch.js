'use strict';
function App (_p5) {
  window._appP5 = _p5;
  const gameState = {
    maze: null,
    currentRoom: null,
    currentTurn: 0,
    energyRemaining: 16,
    inventory: {
      food: 0,
      hasSword: false,
      hasWumpus: false,
    },
    hasMoved: false,
    gameOver: false,
    wumpusName: '',
    wumpusGrowthScale: 1,
  };

  const commonStrings = {
    ASCEND_STAIRS: 'Ascend up the stairs',
    OPEN_CHEST: 'Open the chest',
    CONTINUE: 'Continue',
    WUMPUS_CHEST_FAIL: 'You attempt to open the chest, but the Wumpus charges at you and flattens you.',
    WUMPUS_STAIRS_FAIL: 'You attempt to ascend the stairs, but the Wumpus doens\'t like being ignored and charges the stairway, collapsing it on top of you.',
  };

  const uiElements = {
    canvas: null,
    roomDescription: _p5.createElement('h2', 'room description'),
    availableButtons: [],
    swordImage: null,
    otherElements: {},
  };

  function drawButtons (data = [{ label: 'example label', action: () => {} }]) {
    data.forEach(({ label, action }, index) => {
      let button = uiElements.availableButtons[index];
      if (!button) {
        button = _p5.createButton('button');
        button._pInst = _p5;
        uiElements.availableButtons.push(button);
      }
      button.html(label);
      button.mousePressed(action);
      button.show();
    });

    // hide other buttons
    uiElements.availableButtons.slice(data.length).forEach(button => {
      button.hide();
    });
  }

  function drawContinueButton () {
    drawButtons([{
      label: commonStrings.CONTINUE,
      action: () => scenes.drawRoom(),
    }]);
  }

  function getRoomButtonConfig (rooms = [], otherAction) {
    return [{
      label: 'Do something else',
      action: otherAction,
    }].concat(
      rooms.map(nextRoom => ({
        label: `Go to room ${nextRoom}`,
        action() {
          gameState.currentRoom = gameState.maze.getRoomInfo(nextRoom);
          gameState.hasMoved = true;
          scenes.drawRoom();
        }
      }))
    );
  }
  function resetGame () {
    gameState.gameOver = false;
    gameState.currentRoom = null;
    gameState.currentTurn = 0;
    gameState.energyRemaining = 16;
    gameState.inventory.food = 0;
    gameState.inventory.hasWumpus = false;
    gameState.inventory.hasSword = false;
    gameState.wumpusName = '';
    gameState.wumpusGrowthScale = 1;
    uiElements.roomDescription.hide();
    uiElements.availableButtons = uiElements.availableButtons.map(button => button.remove()).filter(() => false);
  }

  const scenes = {
    beginning () {
      resetGame();
      const instructionTitle = _p5.createElement('h1', 'The Maze');
      const instructionText = _p5.createElement('p');
      const instructions = [
        'You\'ve fallen into a place known only as "The Maze".',
        'You must escape to survive.',
        'Be wary of the beast known to wander The Maze, as it may not be friendly.',
      ].join(' ');
      instructionText.html(instructions);

      drawButtons([
        {
          label: 'Begin your escape',
          action () {
            instructionTitle.remove();
            instructionText.remove();
            gameState.maze = new Maze();
            gameState.currentRoom = gameState.maze.getStartRoom();
            // gameState.maze._chestRooms.push(gameState.currentRoom.currentRoom);
            // gameState.maze._wumpusRoom = gameState.currentRoom.currentRoom;
            scenes.drawRoom();
          },
        }
      ])
      uiElements.canvas.show();
    },
    drawRoomButtons () {
      const availableActions = [];

      // room travel related Wumpus actions
      if (gameState.currentRoom.hasWumpus) {
        availableActions.push({
          label: 'Run Away',
          action () {
            const canRunAway = !gameState.maze.doesWumpusAct();
            if (canRunAway) {
              const randomFloorIndex = Math.floor(Math.random() * 3);
              gameState.currentRoom = gameState.maze.getRoomInfo(gameState.currentRoom.surroundingRooms[randomFloorIndex]);
              gameState.maze.moveWumpus();
              uiElements.roomDescription.html('You have successfully escaped the Wumpus.');
              gameState.hasMoved = true;
              drawContinueButton();
            } else {
              scenes.gameOver('You attempt to flee, but the Wumpus sees it as an attack and body slams you into the wall, killing you instantly.');
            }
          }
        });
      } else {
        availableActions.push({
          label: 'Go to another room',
          action () {
            const roomConfig = getRoomButtonConfig(gameState.currentRoom.surroundingRooms, scenes.drawRoomButtons);
            drawButtons(roomConfig);
            uiElements.canvas.show();
          }
        });
      }

      // sword actions
      if (gameState.inventory.hasSword && (gameState.currentRoom.hasWumpus || gameState.inventory.hasWumpus)) {
        availableActions.push({
          label: gameState.currentRoom.hasWumpus ? 'Fight the Wumpus' : `Attack ${gameState.wumpusName}`,
          action: () => scenes.attackWumpus(),
        });
      }

      // stairs button
      if (gameState.currentRoom.hasEnd) {
        availableActions.push({
          label: commonStrings.ASCEND_STAIRS,
          action () {
            const canSafelyAscend = !gameState.currentRoom.hasWumpus || !gameState.maze.doesWumpusAct();
            if (canSafelyAscend) {
              const finishText = [
                'You ascend the stairs and successfully escape The Maze.',
                gameState.maze.hasWumpus && 'The beast still lives, however.',
                !gameState.maze.hasWumpus && gameState.inventory.hasWumpus && 'You have also made a new friend in the Wumpus.',
                !gameState.maze.hasWumpus && !gameState.inventory.hasWumpus && 'The Wumpus no longer lives. It shall roam the maze no more... Right?',
              ].filter(val => val).join('<br>');
              scenes.gameOver(finishText);
            } else {
              scenes.gameOver(commonStrings.WUMPUS_STAIRS_FAIL);
            }
          }
        });
      }

      // chest button
      if (gameState.currentRoom.hasChest) {
        availableActions.push({
          label: commonStrings.OPEN_CHEST,
          action () {
            const canOpenChest = !gameState.currentRoom.hasWumpus || !gameState.maze.doesWumpusAct();
            if (canOpenChest) {
              gameState.maze.removeChest(gameState.currentRoom.currentRoom);
              const contents = gameState.maze.getChestContents();
              if (contents === 'food') {
                uiElements.roomDescription.html('You found some food.');
                gameState.inventory.food++;
              } else if (contents === 'sword') {
                uiElements.roomDescription.html('You found a sword.');
                gameState.inventory.hasSword = true;
              } else {
                uiElements.roomDescription.html('The chest is empty.');
              }
              drawContinueButton();
              uiElements.canvas.show();
            } else {
              scenes.gameOver(commonStrings.WUMPUS_CHEST_FAIL);
            }
          }
        });
      }

      // trap related button(s)
      if (gameState.currentRoom.trapContents) {
        if (gameState.currentRoom.trapContents === 'trapStairs') {
          availableActions.push({
            label: commonStrings.ASCEND_STAIRS,
            action: () => scenes.gameOver('You start to ascend the stairs, but a boulder falls and kills you.'),
          });
        } else if (gameState.currentRoom.trapContents === 'mimic') {
          availableActions.push({
            label: commonStrings.OPEN_CHEST,
            action: () => {
              const doesWumpusAct = gameState.inventory.hasWumpus && (gameState.maze.doesWumpusAct() || gameState.maze.doesWumpusAct());
              if (doesWumpusAct) {
                uiElements.roomDescription.html('You attempt to open the chest, but it stands up and tries to eat you. However, the Wumpus eats it instead, saving you.');
                gameState.maze.removeTrap(gameState.currentRoom.currentRoom);
                drawContinueButton();
              } else {
                scenes.gameOver('You attempt to open the chest, but it stands up and eats you.');
              }
            },
          });
        }
      }

      if (gameState.inventory.food > 0) {
        availableActions.push({
          label: 'Eat the food',
          action () {
            gameState.inventory.food--;
            gameState.energyRemaining += 10;
            uiElements.roomDescription.html('You ate the food and gained some stamina');
            drawContinueButton();
            uiElements.canvas.show();
          }
        });
        if (gameState.currentRoom.hasWumpus) {
          availableActions.push({
            label: 'Feed the Wumpus',
            action () {
              const doesSafelyFeed = !gameState.maze.doesWumpusAct();
              if (doesSafelyFeed) {
                gameState.inventory.hasWumpus = true;
                gameState.inventory.food--;
                gameState.maze.removeWumpus();
                scenes.tameWumpus('You feed the Wumpus. It seems happy and wants to follow you around.');
                uiElements.canvas.show();
              } else {
                scenes.gameOver('You attempt to feed the Wumpus. It eats the food, your hand, your arm, and the rest of you.');
              }
            },
          });
        }
      }
      drawButtons(availableActions);
      uiElements.canvas.show();
    },
    drawRoom (incrementCounters = true) {
      if (incrementCounters) {
        gameState.currentRoom = gameState.maze.getRoomInfo(gameState.currentRoom.currentRoom);
        gameState.currentTurn++;
        gameState.energyRemaining--;
        if (gameState.currentTurn % 5 === 0 && Math.random() < 0.5 && gameState.maze.numChests < 5) {
          gameState.maze.addChest();
        }
        if (gameState.currentTurn % 5 === 0 && Math.random() < 0.5 && gameState.maze.emptySpaces > 5) {
          gameState.maze.addTrap();
        }
      }

      // resetButtons();
      const roomDescriptionText = [
        gameState.currentTurn !== 1 ? (gameState.hasMoved && `You${gameState.inventory.hasWumpus ? ` and ${gameState.wumpusName}` : ''} arrive at the next room.`) : 'You wake up in a room and see three different hallways branching from your current room.',
        (gameState.currentRoom.hasPit && gameState.inventory.hasWumpus) && `You almost fall into a pit, but ${gameState.wumpusName} stops you from falling.`,
        `Next to each of the three hallways reads the numbers ${gameState.currentRoom.surroundingRooms.join(', ')}.`,
        gameState.currentRoom.hazardHint && gameState.currentRoom.hazardHint.length > 0 && `There's ${gameState.currentRoom.hazardHint.join(' and ')} coming from the surrounding hallways.`,
        gameState.currentRoom.hasWumpus && 'You have found the beast known as the Wumpus. It stares at you.',
        (gameState.currentRoom.hasChest || gameState.currentRoom.trapContents === 'mimic') && 'There\'s a chest in the room.',
        (gameState.currentRoom.hasEnd || gameState.currentRoom.trapContents === 'trapStairs') && 'There are stairs in the middle of the room.',
        'What will you do?',
      ].filter(val => val);
      uiElements.roomDescription.html(roomDescriptionText.join('<br>'));
      uiElements.roomDescription.show();

      if (gameState.currentRoom.hasPit && !gameState.inventory.hasWumpus) {
        scenes.gameOver('You fell into a pit and died.');
      } else if (gameState.energyRemaining === 0) {
        scenes.gameOver('You ran out of stamina and fainted.');
      } else {
        this.drawRoomButtons();
      }
      uiElements.canvas.show();
      // console.debug(gameState.currentRoom);
      gameState.hasMoved = false;
    },
    gameOver (reason = 'You died') {
      gameState.gameOver = true;
      uiElements.roomDescription.html(reason);
      drawButtons([
        {
          label: 'Start Over',
          action: () => scenes.beginning(),
        }
      ]);
      uiElements.canvas.show();
    },
    attackWumpus () {
      uiElements.roomDescription.html('Where do you hit?');
      let attackRadio = uiElements.otherElements.attackRadio;
      if (!attackRadio) {
        attackRadio = _p5.createRadio();
        attackRadio.option('high');
        attackRadio.option('middle');
        attackRadio.option('low');
        attackRadio.style('width', '65px');

        // set default to first option
        attackRadio.elt.querySelector('input').checked = true;

        uiElements.otherElements.attackRadio = attackRadio;
      }
      attackRadio.show();
      drawButtons([{
        label: 'Attack',
        action () {
          const winsFight = !gameState.maze.doesWumpusAct();
          const attackLocation = attackRadio.value();
          const prefix = attackLocation === 'middle' ? `You jab straight ahead with your sword` : `You swing ${attackLocation} with your sword`;
          const guiltMessage = gameState.inventory.hasWumpus && 'It gives you a look of betrayal and surprise.';
          if (winsFight) {
            gameState.maze.removeWumpus();
            const killMessage = [
              `${prefix} and pierce the heart of ${gameState.wumpusName || 'the Wumpus'}.`,
              guiltMessage,
              `You have successfully slain ${gameState.wumpusName || 'the Wumpus'}.`,
            ].filter(val => val).join('<br>');
            gameState.inventory.hasWumpus = false;
            uiElements.roomDescription.html(killMessage);
            drawContinueButton();
          } else {
            const missPrefix = attackLocation === 'middle' ? `${prefix}, but ${gameState.wumpusName || 'the Wumpus'} dodges to the side.` : `${prefix}, but ${gameState.wumpusName || 'the Wumpus'} ${attackLocation === 'low' ? 'jumps over' : 'ducks under'} it.`;
            scenes.gameOver([
              missPrefix,
              guiltMessage,
              `In retaliation, ${gameState.wumpusName || 'the Wumpus'} pulls out its own sword and fatally stabs you.`,
            ].filter(val => val).join('<br>'));
          }
          attackRadio.hide();
        },
      },
      {
        label: 'Do something else',
        action: () => {
          attackRadio.hide();
          scenes.drawRoom(false);
        },
      },
    ]);
    },
    tameWumpus (message = 'You have successfully tamed the Wumpus.') {
      uiElements.roomDescription.html([message, 'What would you like to name it?'].join('<br>'));
      let nameInput = uiElements.otherElements.nameInput;
      if (!nameInput) {
        nameInput = _p5.createInput();
      }
      let hasDrawnButtons = false;
      drawButtons([]);
      nameInput.input(() => {
        const name = nameInput.value();
        if (name && !hasDrawnButtons) {
          hasDrawnButtons = true;
          drawButtons([
            {
              label: 'Continue',
              action () {
                nameInput.hide();
                gameState.wumpusName = nameInput.value();
                scenes.drawRoom();
              }
            }
          ]);
        } else if (!name) {
          hasDrawnButtons = false;
          drawButtons([]);
        }
      });
    }
  };

  _p5.preload = () => {
    uiElements.swordImage = _p5.loadImage('./Sword_01.svg');
  };

  _p5.setup = () => {
    uiElements.canvas = _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    uiElements.canvas.position(0, 0);
    uiElements.canvas.style('z-index', '-1');
    uiElements.canvas.background(0);
    _p5.fill(255);
    _p5.textSize(25);

    scenes.beginning();
  };

  function drawWumpus (x, y, size) {
    // face
    _p5.fill(200);
    _p5.rect(x, y, size, size * 0.9, 25);

    // eyes
    _p5.fill(0);
    _p5.ellipse(x + size * 0.25, y + size * 0.25, size * 0.2, size * 0.2);
    _p5.ellipse(x + size * 0.75, y + size * 0.25, size * 0.2, size * 0.2);

    // nose
    const nostrilWidth = size * 0.15;
    _p5.fill(200);
    _p5.rect(x + size * 0.25, y + size * 0.5, size * 0.5, size * 0.25, 15);
    _p5.fill(0);
    _p5.rect(x + size * 0.3, y + size * 0.6, nostrilWidth, size * 0.1 , 15);
    _p5.rect(x + size * 0.75 - nostrilWidth - size * 0.05, y + size * 0.6, nostrilWidth, size * 0.1, 15);
  }

  function getSwordDimensions () {
    const ratio = uiElements.swordImage.height / uiElements.swordImage.width;
    const width = _p5.width * 0.1;
    return {
      width,
      height: width * ratio,
    };
  }

  _p5.draw = () => {
    _p5.background(0);
    if (gameState.currentRoom && gameState.currentRoom.hasWumpus) {
      if (gameState.gameOver) {
        gameState.wumpusGrowthScale += 0.1;
      }
      const wumpusWidth = Math.min(Math.max(_p5.width, _p5.height) * 0.25 * gameState.wumpusGrowthScale, _p5.width * 0.9, _p5.height * 0.9);
      const wumpusHeight = wumpusWidth * 0.9;
      const wumpusX = _p5.width / 2 - wumpusWidth / 2 + ((gameState.gameOver || !gameState.maze.hasWumpus) ? 0 : _p5.random(-3, 3));
      const wumpusY = _p5.height / 2 - wumpusHeight / 2 + ((gameState.gameOver || !gameState.maze.hasWumpus) ? 0 : _p5.random(-3, 3));
      drawWumpus(wumpusX, wumpusY, wumpusWidth);
    }

    if (uiElements.swordImage && gameState.inventory.hasSword) {
      const { width, height } = getSwordDimensions();
      // draw on bottom left
      _p5.image(uiElements.swordImage, 0, _p5.height - height, width, height);
    }

    if (gameState.inventory.hasWumpus) {
      const wumpusSize = _p5.width * 0.1;
      const wumpusHeight = wumpusSize * 0.9;
      // draw on bottom right
      drawWumpus(_p5.width - wumpusSize * 1.1, _p5.height - wumpusHeight * 1.1, wumpusSize);

      if (gameState.wumpusName) {
        _p5.fill(255);
        _p5.text(gameState.wumpusName, _p5.width - wumpusSize * 1.1, _p5.height - wumpusHeight * 1.1 - 50);
      }
    }

    if (gameState.currentTurn > 0) {
      _p5.fill(255);
      _p5.text(`Turn: ${gameState.currentTurn}`, _p5.width - 200, 50);
      _p5.text(`Stamina: ${gameState.energyRemaining}`, _p5.width - 200, 100);
      if (gameState.inventory.food > 0) {
        _p5.text(`Food Items: ${gameState.inventory.food}`, _p5.width - 200, 150);
      }
    }
  };


  window[Symbol.for('gamestate')] = gameState;
}
