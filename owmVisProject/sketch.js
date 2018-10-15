'use strict';
function App (_p5) {
  window._appP5 = _p5;

  const dataCollector = new DataCollector();
  const dataKeys = {
    weather: 'weather',
    sun: 'sun',
    bikeIncidents: 'bikeIncidents',
  };
  const mapBounds = {
    lat: [],
    lon: [],
  };
  let isFirstDataEntry = true;

  let activeIncident = {
    _index: -1,
    set index (val) {
      if (val === this._index) {
        return;
      } else {
        this._index = val;
      }

      if (val === -1) {
        this.value = null;
      }
      try {
        this.value = dataCollector.getData(dataKeys.bikeIncidents).features[val];
      } catch (err) {
        console.error('error getting value', err);
        this.value = null;
      }
      console.debug('updated active incident value to', this.value);
      updateTooltip();
    },
    get index () {
      return this._index;
    },
    value: null,
  };

  const uiElements = {
    unitSelector: null,
    locationSearch: null,
    descriptionTooltip: null,
  };

  // const mousePosition = {
  //   x: 0,
  //   y: 0
  // };
  // document.onmousemove = e => {
  //   mousePosition.x = e.pageX;
  //   mousePosition.y = e.pageY;
  // }

  function updateTooltip () {
    let tooltip = uiElements.descriptionTooltip;
    if (!tooltip) {
      tooltip = _p5.createElement('div');
      tooltip.class('tooltip');
      uiElements.descriptionTooltip = tooltip;
    }

    if (!activeIncident.value) {
      tooltip.hide();
    } else {
      tooltip.elt.innerHTML = JSON.stringify(activeIncident.value);
      tooltip.position(_p5.mouseX, _p5.mouseY);
      tooltip.show();
    }
    console.debug(tooltip);
  }

  const weatherConfig = {
    location: 'Chicago',
    units: 'imperial',
  };

  function generateWeatherUrl (location = 'Chicago,us', units = 'imperial') {
    return [
      `https://api.openweathermap.org/data/2.5/weather?q=${location}`,
      `appid=ea59760eb0a97d59a6da4eb60701f0e4`,
      `units=${units}`,
    ].join('&');
  }

  function getWeatherData (location, units) {
    return fetch(generateWeatherUrl(location, units))
      .then(response => response.json());
  }

  function updateWeatherData () {
    setTimeout(() => {
      isFirstDataEntry = true;
    }, 1000);
    return dataCollector.update(dataKeys.weather);
  }

  _p5.preload = () => {
    // weather entry
    dataCollector.add(dataKeys.weather, () => getWeatherData(weatherConfig.location, weatherConfig.units));

    // sun entry
    dataCollector.add(dataKeys.sun, (oldEntry) => {
      const weatherData = dataCollector.getData(dataKeys.weather);
      if (!weatherData || !weatherData.coord) {
        return oldEntry;
      } else {
        const { lon, lat } = weatherData.coord;
        return fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}`)
          .then(response => response.json());
      }
    }); 
    dataCollector.setCustomIntervalFor(dataKeys.sun, 60 * 1000);

    // bike incident entry
    dataCollector.add(dataKeys.bikeIncidents, (oldEntry) => {
      const weatherData = dataCollector.getData(dataKeys.weather);
      if (!weatherData || !weatherData.coord) {
        return oldEntry;
      } else {
        const { lon, lat } = weatherData.coord;
        return fetch(`https://bikewise.org:443/api/v2/locations/markers?proximity_square=100&proximity=${lat},${lon}`)
          .then(response => response.json())
          .then(data => {
            // update map bounds
            let minLat = 1000, maxLat = -1000;
            let minLon = 1000, maxLon = -1000;

            if (data && data.features) {
              data.features.forEach(feature => {
                const [lon, lat] = feature.geometry.coordinates;
                minLat = Math.min(lat, minLat);
                maxLat = Math.max(lat, maxLat);

                minLon = Math.min(lon, minLon);
                maxLon = Math.max(lon, maxLon);
              });
              mapBounds.lat = [minLat, maxLat];
              mapBounds.lon = [minLon, maxLon];
              console.debug(mapBounds);
            }
            return data;
          });
      }
    });
    dataCollector.setCustomIntervalFor(dataKeys.bikeIncidents, 60 * 1000);
  };

  _p5.setup = () => {
    console.debug('entered setup');
    
    dataCollector.updateAll();

    _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);

    // location search input
    uiElements.locationSearch = _p5.createInput();
    uiElements.locationSearch.position(10, 0);
    uiElements.locationSearch.value(weatherConfig.location); // default
    // ['Chicago', 'London', 'New York', 'Miami', 'Tokyo', 'Athens'].forEach(val => uiElements.locationDropdown.option(val));
    uiElements.locationSearch.changed(() => {
      weatherConfig.location = uiElements.locationSearch.value();
      updateWeatherData();
    });

    // uiElements.unitSelector = _p5.createSelect();
  };

  function drawBikeIncidentMap (xOffset = 0, yOffset = 0, xEndOffset = 0, yEndOffset = 0) {
    const featureCollection = dataCollector.getData(dataKeys.bikeIncidents);
    if (!featureCollection || featureCollection.error) {
      return;
    }

    _p5.stroke(255);
    _p5.ellipseMode(_p5.CENTER);
    const mapLat = (lat) => _p5.map(lat, mapBounds.lat[0], mapBounds.lat[1], xOffset, _p5.width - xEndOffset);
    const mapLon = (lon) => _p5.map(lon, mapBounds.lon[0], mapBounds.lon[1], yOffset, _p5.height - yEndOffset);

    let activeIndex = activeIncident.index;
    let mouseIsOnPoint = false;
    // display points and get point near mouse
    featureCollection.features.forEach((feature, i) => {
      const [lon, lat] = feature.geometry.coordinates;
      const [x, y] = [mapLat(lat), mapLon(lon)];
      _p5.fill(_p5.color(feature.properties['marker-color']));
      if (Math.abs(_p5.mouseX - x) < 10 && Math.abs(_p5.mouseY - y) < 10) {
        _p5.strokeWeight(1);
        if (_p5.mouseIsPressed) {
          mouseIsOnPoint = true;
          activeIndex = i;
        }
      } else if (activeIncident.index === i) {
        _p5.strokeWeight(3);
      } else {
        _p5.strokeWeight(0);
      }
      _p5.ellipse(x, y, 10, 10);
    });
    if (!mouseIsOnPoint && _p5.mouseIsPressed) {
      activeIndex = -1;
    }
    activeIncident.index = activeIndex;
  }

  _p5.draw = () => {
    _p5.background(0);
    const padding = 100;
    _p5.stroke(255);
    _p5.fill(0);
    _p5.strokeWeight(5);
    _p5.ellipseMode(_p5.CENTER);
    // const size = Math.min(_p5.width, _p)
    // _p5.ellipse(_p5.width / 2, _p5.height / 2, _p5.width - padding, _p5.height - padding);
    _p5.rect(padding, padding, _p5.width - padding * 2, _p5.height - padding * 2);

    _p5.strokeWeight(0);
    _p5.fill(255);
    _p5.textSize(30);
    const weatherData = dataCollector.getData(dataKeys.weather);
    if (!weatherData) {
      _p5.text('Loading weather data...', 10, 50);
      isFirstDataEntry = true;
      return;
    } else if (weatherData.cod && +weatherData.cod === 404) {
      _p5.text(`Error getting weather data: ${weatherData.message}`, 10, 50);
      isFirstDataEntry = true;
      return;
    }

    // update data on first instance of valid weather data
    if (isFirstDataEntry) {
      dataCollector.update(dataKeys.sun);
      dataCollector.update(dataKeys.bikeIncidents);
      isFirstDataEntry = false;
    }
    _p5.text(`${weatherData.name} (${weatherData.sys.country}) Status: ${weatherData.weather[0].description}`, 10, 50);
    _p5.text(`Updated: ${Math.floor((new Date() - dataCollector.getUpdateTime(dataKeys.weather)) / 1000)} seconds ago`, 10, 80);

    drawBikeIncidentMap(padding, padding, padding, padding);
  };
}
