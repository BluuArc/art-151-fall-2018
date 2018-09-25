class Maze {
  constructor () {
    this._map = Maze.defaultMap;
    this._startRoom = Math.ceil(Math.random() * 20);
    this._wumpusRoom = 0;
    this._pitRooms = [];
    this._chestRooms = [];
    this._trapRooms = [];

    this._finishRoom = 0;

    this._initializeRooms();
  }

  // map source: https://sites.google.com/site/uic141spring2016/prog-6-wumpus
  static get defaultMap () {
    const generateRoom = (r1, r2, r3) => Object.freeze([r1, r2, r3]);

    return {
      1: generateRoom(5, 8, 2),
      2: generateRoom(1, 10, 3),
      3: generateRoom(2, 12, 4),
      4: generateRoom(3, 14, 5),
      5: generateRoom(1, 4, 6),
      6: generateRoom(5, 7, 15),
      7: generateRoom(8, 6, 17),
      8: generateRoom(1, 7, 9),
      9: generateRoom(8, 10, 18),
      10: generateRoom(9, 11, 2),
      11: generateRoom(10, 19, 12),
      12: generateRoom(3, 11, 13),
      13: generateRoom(12, 20, 14),
      14: generateRoom(4, 13, 15),
      15: generateRoom(6, 14, 16),
      16: generateRoom(17, 15, 20),
      17: generateRoom(18, 7, 16),
      18: generateRoom(17, 9, 19),
      19: generateRoom(18, 11, 20),
      20: generateRoom(19, 13, 16),
    };
  }

  _initializeRooms () {
    let filledRooms = [this._startRoom];

    this._wumpusRoom = this.generateRandomPosition(filledRooms);
    filledRooms.push(this._wumpusRoom);

    this._pitRooms.push(this.generateRandomPosition(filledRooms));
    this._pitRooms.push(this.generateRandomPosition(filledRooms.concat([this._pitRooms[0]])));
    filledRooms = filledRooms.concat(this._pitRooms);

    for (let i = 0; i < 5; ++i) {
      this.addChest();
    }
    filledRooms.push(...this._chestRooms);

    for (let i = 0; i < 5; ++i) {
      this._trapRooms.push(this.generateRandomPosition(filledRooms.concat(this._trapRooms)));
    }
    filledRooms = filledRooms.concat(this._trapRooms);

    this._finishRoom = this.generateRandomPosition([this._startRoom].concat(this._pitRooms));
  }

  generateRandomPosition (excludedRooms = []) {
    if (excludedRooms.length >= 20) {
      throw Error(`Too many excluded rooms (${excludedRooms.length})`);
    }
    let result = Math.ceil(Math.random() * 20);
    while (excludedRooms.includes(result)) {
      result = Math.ceil(Math.random() * 20);
    }
    return result;
  }

  getRoomInfo (roomPosition) {
    if (isNaN(roomPosition) || !this._map[+roomPosition]) {
      throw Error(`Unknown room: ${roomPosition}`);
    }

    const position = +roomPosition;
    return {
      currentRoom: position,
      surroundingRooms: this._map[position],
      hasWumpus: this._wumpusRoom === position,
      hasPit: this._pitRooms.includes(position),
      hasChest: this._chestRooms.includes(position),
      trapContents: this._trapRooms.includes(position) && this.getTrapContents(),
      hasEnd: this._finishRoom === position,
    };
  }

  getStartRoom () {
    return this.getRoomInfo(this._startRoom);
  }

  getTrapContents () {
    const rngValue = Math.random();
    if (rngValue < 0.25) {
      return 'trapStairs';
    } else if (rngValue < 0.5) {
      return 'mimic';
    } else {
      return null;
    }
  }

  getChestContents () {
    const rngValue = Math.random();
    if (rngValue < 0.25) {
      return 'food';
    } else if (rngValue < 0.5) {
      return 'sword';
    } else {
      return null;
    }
  }

  removeChest (room) {
    this._chestRooms = this._chestRooms.filter(val => val !== room);
  }

  get numChests () {
    return this._chestRooms.length;
  }

  addChest () {
    this._chestRooms.push(this.generateRandomPosition(this._chestRooms.concat(this._trapRooms, this._pitRooms)));
  }

  addTrap () {
    const excludedRooms = this._chestRooms.concat([this._finishRoom], this._pitRooms, this._trapRooms);
    this._trapRooms.push(this.generateRandomPosition(excludedRooms));
  }

  removeTrap (room) {
    this._trapRooms = this._trapRooms.filter(val => val !== room);
  }

  get emptySpaces () {
    return Object.keys(this._map).length - (this._chestRooms.length + this._trapRooms.length + this._pitRooms.length);
  }

  removeWumpus () {
    this._wumpusRoom = 0;
  }

  get hasWumpus () {
    return this._wumpusRoom !== 0;
  }

  moveWumpus () {
    const excludedRooms = this._chestRooms.concat([this._finishRoom], this._pitRooms, this._trapRooms);
    this._wumpusRoom = this.generateRandomPosition(excludedRooms);
  }

  doesWumpusAct () {
    return Math.random() < 0.5;
  }
}
