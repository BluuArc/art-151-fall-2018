'use strict';
function App (_p5) {
  window._appP5 = _p5;
  let weatherData;
  let dinosaurs;

  let windX = 0;
  let lastUpdateTime = new Date();
  const uiElements = {
    locationDropdown: null,
  };

  const weatherConfig = {
    location: 'Chicago,us',
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
    if (window._weatherUpdateInterval) {
      clearInterval(window._weatherUpdateInterval);
    }
    return getWeatherData(weatherConfig.location, weatherConfig.units)
      .then(data => {
        weatherData = data;
        lastUpdateTime = new Date();
        window._weatherUpdateInterval = setInterval(updateWeatherData, 15 * 1000);
        console.debug('got weather data', weatherData);
      });
  }

  _p5.preload = () => {
    updateWeatherData();
    dinosaurs = _p5.loadJSON('dinosaurs.json');
  };

  _p5.setup = () => {
    console.debug('entered setup');
    _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    uiElements.locationDropdown = _p5.createSelect();
    uiElements.locationDropdown.position(10, 0);
    ['Chicago', 'London', 'New York', 'Miami', 'Tokyo', 'Athens'].forEach(val => uiElements.locationDropdown.option(val));
    uiElements.locationDropdown.changed(() => {
      weatherConfig.location = uiElements.locationDropdown.value();
      updateWeatherData();
    });
  };

  function getDinoBasedOnTemperature (temperature) {
    const mappedIndex = Math.floor(_p5.map(temperature, -20, 105, 0, dinosaurs.dinosaurs.length));
    return dinosaurs.dinosaurs[mappedIndex];
  }

  _p5.draw = () => {
    _p5.background(0);
    _p5.fill(255);
    _p5.textSize(30);
    if (!weatherData) {
      _p5.text('Loading weather data...', 10, 50);
      return;
    }
    _p5.text(`${weatherData.name} (${weatherData.sys.country}) Status: ${weatherData.weather[0].description}`, 10, 50);
    _p5.text(`Updated: ${Math.floor((new Date() - lastUpdateTime) / 1000)} seconds ago`, 10, 80);
    _p5.text(`Dinosaur: ${getDinoBasedOnTemperature(weatherData.main.temp)} (${weatherData.main.temp}F)`, 10, 110);

    windX += weatherData.wind.speed;
    if (windX > _p5.width) {
      windX = 0;
    }
    
    // _p5.fill(_p5.map(weatherData.main.temp, -20, 105, 0, 255), 0, 0);
    // _p5.rect(windX, _p5.height / 2, 50, 50);

    const temp = weatherData.main.temp;
    _p5.ellipse(_p5.width / 2, _p5.height / 2, temp, temp);
  };
}
