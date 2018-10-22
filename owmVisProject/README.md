# OpenWeatherMaps Visualization Project

Make a weather application using your Open Weather API key. Combine this with another JSON file and find interesting relationships, or lack thereof, between weather and the data of your choice. For instance, instead of wind speed related to the speed of an object, maybe it’s related to the dimensions of an image from a Google image search of wind. Or maybe create a poetic composition with the weather conditions and a list of fruit.

This project combines OpenWeatherMap data with bike incidents from [the BikeWise API](https://www.bikewise.org/documentation/api_v2) to show a circular map of incidents in and around Chicago as well as the current weather in those areas.

## Instructions
* Left click any dot on the map to view data about that incident.
* Right click anywhere on the map to move the weather circle over that area and reveal weather information about that area. The color of the circle corresponds to the temperature in that area (i.e. warmer colors for warmer temps, cooler colors for cooler temps)
* Drag the top of the popup to move the popup across the screen.

## Requirements

* use at least one DOM object (text boxes, drop down menus, buttons)
  * Proximity input in top left of dash board allows user to define the proximity around Chicago to show incidents for
  * Tooltip is a floating `div` for showing details.
  * Tooltip contains two main buttons in the toolbar, `?` for showing the instructions and `X` for closing the popup.
* use at least two JSON files (weather and JSON of your choice)
  * OWM data
  * bike incident data from [the BikeWise API](https://www.bikewise.org/documentation/api_v2#!/locations)
* use callbacks
  * many used for Promises, loops, and action listeners (such as `changed`, `mouseOver`, and `mouseOut`)


## Other
* Libraries Used
  * P5
  * D3
  * DateFns
  * [Marked](https://github.com/markedjs/marked) for compiling the readme file into HTML on-the-fly

