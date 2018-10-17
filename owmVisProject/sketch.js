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
    maxSize: 0,
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

  function pointsToPolarVector (point1 = [], point2 = []) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const [xDiff, yDiff] = [x2 - x1, y2 - y1]; // point2 - point1
    let angle = Math.atan(yDiff / xDiff); // in radians
    if (xDiff < 0) { // quadrants II and III
      angle += Math.PI;
    } else if (xDiff > 0 && yDiff < 0) { // quadrant IV
      angle += 2 * Math.PI;
    }
    return {
      size: Math.sqrt(xDiff * xDiff + yDiff * yDiff),
      angle,
      degAngle: angle * 180 / Math.PI,
    };
  }

  // assumption: angle in radians
  function polarVectorToCartesianCoords ({ size, angle }, startPoint = [0, 0]) {
    const [x, y] = startPoint;
    return [
      x + size * Math.cos(angle),
      y + size * Math.sin(angle),
    ];
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
        const centerPoint = [weatherData.coord.lon, weatherData.coord.lat];
        return fetch(`https://bikewise.org:443/api/v2/locations/markers?proximity_square=100&proximity=${centerPoint[1]},${centerPoint[0]}`)
          .then(response => response.json())
          .then(data => {
            // update map bounds
            let maxSize = -1000;

            if (data && data.features) {
              // get vector for each point
              let lastKnownPolarVector;
              data.features.forEach(feature => {
                const [lon, lat] = feature.geometry.coordinates;
                const polarVector = pointsToPolarVector(centerPoint, [lon, lat]);
                maxSize = Math.max(maxSize, polarVector.size);
                feature.geometry.polarVector = polarVector;
                lastKnownPolarVector = polarVector;
              });
              mapBounds.maxSize = maxSize;
              console.debug(mapBounds, lastKnownPolarVector);
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

  function drawBikeIncidentMap (centerPoint, radius) {
    const featureCollection = dataCollector.getData(dataKeys.bikeIncidents);
    if (!featureCollection || featureCollection.error) {
      return;
    }

    _p5.stroke(255);
    _p5.ellipseMode(_p5.CENTER);
    const getScaledSize = (size) => _p5.map(size, 0, mapBounds.maxSize, 0, radius);

    let activeIndex = activeIncident.index;
    let mouseIsOnPoint = false;
    let lastKnownCoords;
    let preConversionCoords;
    // display points and get point near mouse
    featureCollection.features.forEach((feature, i) => {
      const { polarVector } = feature.geometry;
      let [x, y] = polarVectorToCartesianCoords({ size: getScaledSize(polarVector.size), angle: polarVector.angle });
      preConversionCoords = [x, y];
      // change coords to match canvas coords
      y *= -1;
      x += centerPoint[0];
      y += centerPoint[1];
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
      lastKnownCoords = [x, y];
    });
    if (!mouseIsOnPoint && _p5.mouseIsPressed) {
      activeIndex = -1;
    }
    activeIncident.index = activeIndex;
    window.lastKnownCoords = lastKnownCoords;
    window.centerPoint = centerPoint;
    window.preConversionCoords = preConversionCoords;
  }

  _p5.draw = () => {
    _p5.background(0);
    const padding = 100;
    _p5.stroke(255);
    _p5.fill(0);
    _p5.strokeWeight(5);

    // draw circular map
    _p5.ellipseMode(_p5.CENTER);
    const size = Math.min(_p5.width, _p5.height) - padding;
    const [centerX, centerY] = [_p5.width / 2, _p5.height / 2];
    _p5.ellipse(centerX, centerY, size, size);

    // draw crosshairs
    _p5.strokeWeight(1);
    _p5.line(centerX, centerY - size / 2, centerX, centerY + size / 2);
    _p5.line(centerX - size / 2, centerY, centerX + size / 2, centerY);

    // display weather data
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

    drawBikeIncidentMap([centerX, centerY], size / 2);
  };
}
