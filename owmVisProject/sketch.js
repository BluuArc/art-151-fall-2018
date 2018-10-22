'use strict';
function App (_p5) {
  window._appP5 = _p5;

  const temperatureColorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([90, 0]);
  const dataCollector = new DataCollector();
  const dataKeys = {
    weather: 'weather',
    sun: 'sun',
    bikeIncidents: 'bikeIncidents',
  };
  const bikeWiseConfig = {
    proximity: 100,
  };
  const mapBounds = {
    maxSize: 0,
    size: 0,
    center: null,
  };
  const weatherMarkerLocation = {
    x: 0,
    y: 0,
    data: null,
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
    proximitySelector: null,
    descriptionTooltip: null,
  };

  function updateTooltip () {
    let tooltip = uiElements.descriptionTooltip;
    if (!tooltip) {
      // tooltip = _p5.createElement('div');
      // tooltip.class('tooltip');
      tooltip = new FloatingWindow(_p5);
      uiElements.descriptionTooltip = tooltip;
      tooltip.elem.hide();
    }

    if (!activeIncident.value) {
      tooltip.elem.hide();
    } else {
      tooltip.contentElem.elt.innerHTML = JSON.stringify(activeIncident.value);
      if (!tooltip.isVisible) {
        console.debug('showing tooltip');
        tooltip.elem.position(_p5.mouseX, _p5.mouseY);
        tooltip.elem.show();
      }
    }
    console.debug(tooltip);
  }

  // hardcode to chicago as bikewise api
  const weatherConfig = {
    location: 'Chicago,us',
    units: 'imperial',
  };

  function generateWeatherUrl (location, units = 'imperial', lat, lon) {
    const params = [
      location && `q=${location}`,
      `appid=ea59760eb0a97d59a6da4eb60701f0e4`,
      units && `units=${units}`,
      lat && lon && `lat=${lat}&lon=${lon}`
    ].filter(v => v).join('&');
    return `https://api.openweathermap.org/data/2.5/weather?${params}`;
  }

  function getWeatherData (location, units, lat, lon) {
    return fetch(generateWeatherUrl(location, units, lat, lon))
      .then(response => response.json());
  }

  function pointsToPolarVector (point1 = [], point2 = []) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const [xDiff, yDiff] = [x2 - x1, y2 - y1]; // point2 - point1
    let angle = xDiff !== 0 ? Math.atan(yDiff / xDiff) : 0; // in radians
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

  function canvasCoordToLonLatCoords (
    canvasCoords,
    mapCenter = [_p5.width / 2, _p5.height / 2],
    latLngCenter = [dataCollector.getData(dataKeys.weather).coord.lon, dataCollector.getData(dataKeys.weather).coord.lat],
    mapRadius = mapBounds.size) {
    const canvasVector = pointsToPolarVector(mapCenter, canvasCoords);
    console.debug({canvasCoords, mapCenter, latLngCenter, mapRadius, mapBounds, canvasVector});
    return polarVectorToCartesianCoords({
      angle: canvasVector.angle,
      size: _p5.map(canvasVector.size, 0, mapRadius, 0, mapBounds.maxSize),
    }, latLngCenter);
  }

  _p5.preload = () => {
    // weather entry
    dataCollector.add(dataKeys.weather, () => getWeatherData(weatherConfig.location, weatherConfig.units));

    // sun entry
    // dataCollector.add(dataKeys.sun, (oldEntry) => {
    //   const weatherData = dataCollector.getData(dataKeys.weather);
    //   if (!weatherData || !weatherData.coord) {
    //     return oldEntry;
    //   } else {
    //     const { lon, lat } = weatherData.coord;
    //     return fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}`)
    //       .then(response => response.json());
    //   }
    // }); 
    // dataCollector.setCustomIntervalFor(dataKeys.sun, 60 * 1000);

    // bike incident entry
    dataCollector.add(dataKeys.bikeIncidents, (oldEntry) => {
      const weatherData = dataCollector.getData(dataKeys.weather);
      if (!weatherData || !weatherData.coord) {
        return oldEntry;
      } else {
        const centerPoint = [weatherData.coord.lon, weatherData.coord.lat];
        // return fetch(`https://bikewise.org:443/api/v2/locations/markers?proximity_square=${bikeWiseConfig.proximity}&proximity=${centerPoint[1]},${centerPoint[0]}`)
        return fetch('./chicago-bikewise-sample.json')
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

  function updateWeatherMarkerLocation (x, y) {
    weatherMarkerLocation.x = x;
    weatherMarkerLocation.y = y;
    const [lon, lat] = canvasCoordToLonLatCoords([weatherMarkerLocation.x, weatherMarkerLocation.y]);
    console.debug('new weather marker location', weatherMarkerLocation, [lon, lat]);
    return getWeatherData(null, weatherConfig.units, lat, lon)
      .then(d => {
        weatherMarkerLocation.data = d;
        console.debug('marker weather', d);
        return d;
      });
  }

  function setupWeatherMarkerHandler () {
    const onContextMenu = () => {
      const cursorVector = pointsToPolarVector(mapBounds.center, [_p5.mouseX, _p5.mouseY]);
      if (cursorVector.size <= mapBounds.size / 2) {
        updateWeatherMarkerLocation(_p5.mouseX, _p5.mouseY);
      } else {
        // limit bounds to edge of map
        const edgeCoords = polarVectorToCartesianCoords({ size: mapBounds.size / 2, angle: cursorVector.angle }, mapBounds.center);
        updateWeatherMarkerLocation(edgeCoords[0], edgeCoords[1]);
      }
    };
    // source: https://stackoverflow.com/questions/4909167/how-to-add-a-custom-right-click-menu-to-a-webpage
    if (document.addEventListener) { // IE >= 9; other browsers
      document.addEventListener('contextmenu', function (e) {
        onContextMenu();
        e.preventDefault();
      }, false);
    } else { // IE < 9
      document.attachEvent('oncontextmenu', function () {
        onContextMenu();
        window.event.returnValue = false;
      });
    }
  }

  _p5.setup = () => {
    console.debug('entered setup');
    const label = _p5.createElement('label', 'Proximity (mi.):');
    label.elt.setAttribute('for', 'proximity');
    label.elt.style.color = 'white';
    label.position(10, 0);
    uiElements.proximitySelector = _p5.createInput();
    uiElements.proximitySelector.value(bikeWiseConfig.proximity);
    uiElements.proximitySelector.changed(() => {
      bikeWiseConfig.proximity = +uiElements.proximitySelector.value() || 100;
      dataCollector.update(dataKeys.bikeIncidents);
    });
    uiElements.proximitySelector.position(125, 0);
    _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    setupWeatherMarkerHandler();
    dataCollector.updateAll()
      .then(() => {
        updateWeatherMarkerLocation(_p5.width / 2, _p5.height / 2);
      });

    const padding = 100;
    mapBounds.size = Math.min(_p5.width, _p5.height) - padding;
    mapBounds.center = [_p5.width / 2, _p5.height / 2];
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
    const nearbyPoints = [];
    // display points and get point near mouse
    featureCollection.features.forEach((feature, i) => {
      const { polarVector } = feature.geometry;
      let [x, y] = polarVectorToCartesianCoords({ size: getScaledSize(polarVector.size), angle: polarVector.angle });
      preConversionCoords = [x, y];
      // change coords to match canvas coords
      y *= -1;
      x += centerPoint[0];
      y += centerPoint[1];
      
      if (Math.abs(_p5.mouseX - x) < 10 && Math.abs(_p5.mouseY - y) < 10) {
        _p5.strokeWeight(1);
        nearbyPoints.push(({ feature, index: i, distance: pointsToPolarVector([x, y], [_p5.mouseX, _p5.mouseY]).size }));
        if (_p5.mouseIsPressed) {
          mouseIsOnPoint = true;
        }
      } else if (activeIncident.index === i) {
        _p5.strokeWeight(3);
      } else {
        _p5.strokeWeight(0);
      }
      _p5.fill(_p5.color(feature.properties['marker-color']));
      _p5.ellipse(x, y, 10, 10);
      lastKnownCoords = [x, y];
    });
    if (nearbyPoints.length > 0) {
      const closestFeature = nearbyPoints.sort((a, b) => a.distance - b.distance).shift();
      if (_p5.mouseIsPressed) {
        activeIndex = closestFeature.index;
      }
      _p5.strokeWeight(1);
      _p5.fill(255);
      _p5.text(closestFeature.feature.properties.title, _p5.mouseX, _p5.mouseY);
    }
    if (!mouseIsOnPoint && _p5.mouseIsPressed) {
      activeIndex = -1;
    }
    if (!uiElements.descriptionTooltip || (!uiElements.descriptionTooltip.mouseInTooltip && !uiElements.descriptionTooltip.isMovingWindow)) {
      activeIncident.index = activeIndex;
    }
    // window.lastKnownCoords = lastKnownCoords;
    // window.centerPoint = centerPoint;
    // window.preConversionCoords = preConversionCoords;
  }

  _p5.draw = () => {
    _p5.background(0);
    
    _p5.stroke(255);
    _p5.fill(0);
    _p5.strokeWeight(5);

    // draw circular map
    _p5.ellipseMode(_p5.CENTER);
    const size = mapBounds.size;
    const [centerX, centerY] = mapBounds.center;
    _p5.ellipse(centerX, centerY, size, size);

    // draw crosshairs
    _p5.strokeWeight(1);
    _p5.fill(0);
    _p5.ellipse(centerX, centerY, 2 / 3 * size, 2 / 3 * size);
    _p5.ellipse(centerX, centerY, size / 3, size / 3);

    // draw weather marker
    if (weatherMarkerLocation.x && weatherMarkerLocation.y && weatherMarkerLocation.data) {
      _p5.fill(_p5.color(temperatureColorScale(weatherMarkerLocation.data.main.temp)));
      _p5.ellipse(weatherMarkerLocation.x, weatherMarkerLocation.y, size * 0.15, size * 0.15);
    }

    _p5.fill(0);
    _p5.line(centerX, centerY - size / 2, centerX, centerY + size / 2);
    _p5.line(centerX - size / 2, centerY, centerX + size / 2, centerY);

    // draw axes labels
    for (let i = 1; i <= 3; ++i) {
      _p5.fill(255);
      _p5.stroke(1);
      _p5.textSize(25);
      _p5.text(`${Math.floor(bikeWiseConfig.proximity / 3 * i)} mi`, centerX + (size / 2 * i / 3), centerY);
      _p5.text(`${Math.floor(bikeWiseConfig.proximity / 3 * i)} mi`, centerX, centerY - (size / 2 * i / 3));
    }

    // display weather data
    _p5.strokeWeight(0);
    _p5.fill(255);
    _p5.textSize(30);
    const weatherData = dataCollector.getData(dataKeys.weather);
    if (!weatherData) {
      _p5.text('Loading weather data...', 10, 50);
      isFirstDataEntry = true;
      return;
    } else if (weatherData.cod && +weatherData.cod !== 200) {
      _p5.text(`Error getting weather data: ${weatherData.message}`, 10, 50);
      isFirstDataEntry = true;
      return;
    }

    // update data on first instance of valid weather data
    if (isFirstDataEntry) {
      // dataCollector.update(dataKeys.sun);
      dataCollector.update(dataKeys.bikeIncidents);
      isFirstDataEntry = false;
    }
    _p5.text('Bike Incident Dashboard', _p5.width - 350, 50);

    const markerData = (!weatherMarkerLocation.data || !weatherMarkerLocation.data.name) ? weatherData : weatherMarkerLocation.data;

    // show weather data
    [
      `${markerData.name} (${markerData.sys.country}) Status`,
      // capitalize description
      markerData.weather[0].description.split(' ').map(word => `${word[0].toUpperCase()}${word.slice(1)}`).join(' '),
      `${markerData.main.temp}F (${markerData.main.temp_min}/${markerData.main.temp_max})`
    ].forEach((line, i) => {
      _p5.text(line, 10, 50 + 30 * i);
    });

    drawBikeIncidentMap([centerX, centerY], size / 2);

    if (uiElements.descriptionTooltip && uiElements.descriptionTooltip.isMovingWindow) {
      const tooltip = uiElements.descriptionTooltip;
      const offsetX = -tooltip.toolbar.elt.offsetWidth / 2;
      const offsetY = -tooltip.toolbar.elt.offsetHeight / 2;
      uiElements.descriptionTooltip.elem.position(_p5.mouseX + offsetX, _p5.mouseY + offsetY);
    }
  };
}
