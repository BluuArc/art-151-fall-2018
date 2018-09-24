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

  const commonStrings = {
    ASCEND_STAIRS: 'Ascend up the stairs',
    OPEN_CHEST: 'Open the chest',
    CONTINUE: 'Continue',
  };

  const uiElements = {
    canvas: null,
    roomDescription: _p5.createElement('h2', 'room description'),
    availableButtons: [],
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

  function getRoomButtonConfig (rooms = [], otherAction) {
    return [{
      label: 'Do something else',
      action: otherAction,
    }].concat(
      rooms.map(nextRoom => ({
        label: `Go to room ${nextRoom}`,
        action() {
          gameState.currentRoom = gameState.maze.getRoomInfo(nextRoom);
          scenes.drawRoom();
        }
      }))
    );
  }

  const scenes = {
    beginning () {
      gameState.currentRoom = null;
      gameState.currentTurn = 0;
      gameState.energyRemaining = 16;
      uiElements.roomDescription.hide();
      uiElements.availableButtons = uiElements.availableButtons.map(button => button.remove()).filter(() => false);
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
            scenes.drawRoom();
          },
        }
      ])
      uiElements.canvas.show();
    },
    drawRoomButtons () {
      const availableActions = [
        {
          label: 'Go to another room',
          action () {
            const roomConfig = getRoomButtonConfig(gameState.currentRoom.surroundingRooms, scenes.drawRoomButtons);
            drawButtons(roomConfig);
            uiElements.canvas.show();
          }
        }
      ];

      // stairs button
      if (gameState.currentRoom.hasEnd) {
        availableActions.push({
          label: commonStrings.ASCEND_STAIRS,
          action () {
            scenes.gameOver('You ascend the stairs and successfully escape The Maze.');
          }
        });
      }

      // chest button
      if (gameState.currentRoom.hasChest) {
        availableActions.push({
          label: commonStrings.OPEN_CHEST,
          action () {
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
            drawButtons([{
              label: commonStrings.CONTINUE,
              action: () => scenes.drawRoom(),
            }]);
            uiElements.canvas.show();
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
            action: () => scenes.gameOver('You attempt to open the chest, but it stands up and eats you.'),
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
            drawButtons([{ label: commonStrings.CONTINUE, action: () => scenes.drawRoom() }]);
            uiElements.canvas.show();
          }
        });
      }
      drawButtons(availableActions);
      uiElements.canvas.show();
    },
    drawRoom () {
      gameState.currentRoom = gameState.maze.getRoomInfo(gameState.currentRoom.currentRoom);
      gameState.currentTurn++;
      gameState.energyRemaining--;
      if (gameState.currentTurn % 5 === 0 && Math.random() < 0.5 && gameState.maze.numChests < 5) {
        gameState.maze.addChest();
      }
      if (gameState.currentTurn % 5 === 0 && Math.random() < 0.5 && gameState.mase.emptySpaces > 5) {
        gameState.maze.addTrap();
      }

      // resetButtons();
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
      uiElements.roomDescription.html(reason);
      drawButtons([
        {
          label: 'Start Over',
          action: () => scenes.beginning(),
        }
      ]);
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
