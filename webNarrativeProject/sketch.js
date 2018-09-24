'use strict';
function App (_p5) {
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
  };

  const uiElements = {
    canvas: null,
    roomDescription: _p5.createElement('h2', 'room description'),
    actionButtons: {
      goToRoom: _p5.createButton('Go to Another Room'),
      fight: _p5.createButton('Fight'),
      run: _p5.createButton('Run Away'),
      pet: _p5.createButton('Pet'),
      feed: _p5.createButton('Feed'),
      reset: _p5.createButton('Start Over'),
      continue: _p5.createButton('Continue'),
      end: _p5.createButton('Ascend up the stairs'),
      chest: _p5.createButton('Open the chest'),
      other: _p5.createButton('Do something else'),
      eatFood: _p5.createButton('Eat the food'),
    },
    roomButtons: {
      r1: _p5.createButton('Room 1'),
      r2: _p5.createButton('Room 2'),
      r3: _p5.createButton('Room 3'),
    },
  };

  function resetButtons (buttonSets = ['actionButtons', 'roomButtons']) {
    const resetButton = (button) => {
      if (!button._pInst) {
        button._pInst = _p5;
      }
      button.mousePressed(false);
      button.hide();
    }
    buttonSets.forEach(set => {
      if (uiElements[set]) {
        Object.keys(uiElements[set]).forEach(buttonKey => {
          const button = uiElements[set][buttonKey];
          resetButton(button);
        });
      }
    });
  }

  function setRoomButtons (rooms = [], otherAction) {
    Object.keys(uiElements.roomButtons).filter(key => key !== 'other').forEach((key, index) => {
      const button = uiElements.roomButtons[key];
      const nextRoom = rooms[index];
      button.html(`Go to room ${nextRoom}`);
      button.mousePressed(() => {
        gameState.currentRoom = gameState.maze.getRoomInfo(nextRoom);
        scenes.drawRoom();
      });
      button.show();
    });

    uiElements.actionButtons.other.mousePressed(otherAction);
    uiElements.actionButtons.other.show();
  }

  const scenes = {
    beginning () {
      gameState.currentRoom = null;
      gameState.currentTurn = 0;
      gameState.energyRemaining = 16;
      resetButtons();
      uiElements.roomDescription.hide();
      const instructionTitle = _p5.createElement('h1', 'The Maze');
      const instructionText = _p5.createElement('p');
      const instructions = [
        'You\'ve fallen into a place known only as "The Maze".',
        'You must escape to survive.',
        'Be wary of the beast known to wander The Maze, as it may not be friendly.',
      ].join(' ');
      instructionText.html(instructions);

      const startButton = _p5.createButton('Begin');
      startButton.mouseClicked(() => {
        instructionTitle.remove();
        instructionText.remove();
        startButton.remove();

        gameState.maze = new Maze();
        gameState.currentRoom = gameState.maze.getStartRoom();
        this.drawRoom();
      });
      uiElements.canvas.show();
    },
    drawRoomButtons () {
      uiElements.actionButtons.goToRoom.mousePressed(() => {
        resetButtons(['actionButtons']);
        setRoomButtons(gameState.currentRoom.surroundingRooms, () => {
          resetButtons();
          this.drawRoomButtons();
        });
        uiElements.canvas.show();
      });

      // stairs button
      if (gameState.currentRoom.hasEnd) {
        uiElements.actionButtons.end.mousePressed(() => {
          scenes.gameOver('You ascend the stairs and successfully escape The Maze.');
        });
        uiElements.actionButtons.end.show();
      }

      // chest button
      if (gameState.currentRoom.hasChest) {
        uiElements.actionButtons.chest.mousePressed(() => {
          resetButtons();
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
          uiElements.roomDescription.show();
          uiElements.actionButtons.continue.mousePressed(() => scenes.drawRoom());
          uiElements.actionButtons.continue.show();
          uiElements.canvas.show();
        });
        uiElements.actionButtons.chest.show();
      }

      // trap related button(s)
      if (gameState.currentRoom.trapContents) {
        if (gameState.currentRoom.trapContents === 'trapStairs') {
          uiElements.actionButtons.end.mousePressed(() => {
            scenes.gameOver('You start to ascend the stairs, but a boulder falls and kills you.');
          });
          uiElements.actionButtons.end.show();
        } else if (gameState.currentRoom.trapContents === 'mimic') {
          uiElements.actionButtons.chest.mousePressed(() => {
            scenes.gameOver('You attempt to open the chest, but it stands up and eats you.');
          });
          uiElements.actionButtons.chest.show();
        }
      }

      if (gameState.inventory.food > 0) {
        uiElements.actionButtons.eatFood.mousePressed(() => {
          gameState.inventory.food--;
          gameState.energyRemaining += 10;
          uiElements.roomDescription.html('You ate the food and gained some stamina');
          uiElements.actionButtons.continue.mousePressed(() => scenes.drawRoom());
          uiElements.actionButtons.continue.show();
          uiElements.canvas.show();
        });
        uiElements.actionButtons.eatFood.show();
      }

      uiElements.actionButtons.goToRoom.show();
      uiElements.canvas.show();
    },
    drawRoom () {
      gameState.currentRoom = gameState.maze.getRoomInfo(gameState.currentRoom.currentRoom);
      gameState.currentTurn++;
      gameState.energyRemaining--;
      if (gameState.currentTurn % 5 === 0 && gameState.maze.numChests < 5) {
        gameState.maze.addChest();
      }
      resetButtons();
      const roomDescriptionText = [
        gameState.currentTurn !== 1 ? 'You walk into the next room.' : 'You wake up in a room and see three different hallways branching from your current room.',
        `Next to each of the three hallways reads the numbers ${gameState.currentRoom.surroundingRooms.join(', ')}.`,
        (gameState.currentRoom.hasChest || gameState.currentRoom.trapContents === 'mimic') && 'There\'s a chest in the room.',
        (gameState.currentRoom.hasEnd || gameState.currentRoom.trapContents === 'trapStairs') && 'There are stairs in the middle of the room.',
        'What will you do?',
      ].filter(val => val);
      uiElements.roomDescription.html(roomDescriptionText.join('<br>'));
      uiElements.roomDescription.show();

      if (gameState.currentRoom.hasPit) {
        scenes.gameOver('You fell into a pit and died.');
      } else if (gameState.energyRemaining === 0) {
        scenes.gameOver('You ran out of stamina and fainted.');
      } else {
        this.drawRoomButtons();
      }
      uiElements.canvas.show();
      console.debug(gameState.currentRoom);
    },
    gameOver (reason = 'You died') {
      resetButtons();
      uiElements.roomDescription.html(reason);
      uiElements.actionButtons.reset.mousePressed(() => {
        scenes.beginning();
      });
      uiElements.actionButtons.reset.show();
      uiElements.canvas.show();
    },
  };

  _p5.setup = () => {
    uiElements.canvas = _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    uiElements.canvas.position(0, 0);
    uiElements.canvas.style('z-index', '-1');
    uiElements.canvas.background(0);
    _p5.fill(255);
    _p5.textSize(25);

    scenes.beginning();
  }

  _p5.draw = () => {
    _p5.background(0);
    if (gameState.currentRoom) {
      _p5.text(`Turn: ${gameState.currentTurn}`, _p5.width - 200, 50);
      _p5.text(`Stamina: ${gameState.energyRemaining}`, _p5.width - 200, 100);
    }
  }


  window[Symbol.for('gamestate')] = gameState;
}
