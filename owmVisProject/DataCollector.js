class DataCollector {
  constructor () {
    this._entries = {};
    this._timeouts = {};
    this._updateInterval = 15 * 1000;
    this._customIntervals = {};
  }

  add (key = '', getter = () => {}) {
    this._entries[key] = {
      data: null,
      updatedAt: new Date(),
      getter,
    };
  }

  setCustomIntervalFor (key, interval) {
    this._customIntervals[key] = interval;
  }

  async update (key = '') {
    const entry = this._entries[key];
    if (this._timeouts[key]) {
      clearTimeout(this._timeouts[key]);
    }
    console.debug(key, entry);
    entry.data = await Promise.resolve(entry.getter(entry.data));
    entry.updatedAt = new Date();
    this._timeouts[key] = setTimeout(async () => {
      try {
        await this.update(key);
      } catch (error) {
        console.error(`error updating ${key}`, error);
      }
    }, this._customIntervals[key] || this._updateInterval);
  }

  async updateAll () {
    const keys = Object.keys(this._entries);
    for (const key of keys) {
      await this.update(key);
    }
  }

  getData (key = '') {
    return this._entries[key] && this._entries[key].data;;
  }

  getUpdateTime (key = '') {
    return this._entries[key] && this._entries[key].updatedAt;
  }
}
