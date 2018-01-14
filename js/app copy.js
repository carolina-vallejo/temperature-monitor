var cityID = 2950159;
var appid = '1c052ccd7090e7a17d2da2f5a1e661cb';
var url = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&appid=' + appid + '&units=metric';

var data;
var now = moment();


var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var animation, elapsed;

var timeInterval_ms = 30000;
var rangeTime_ms = 30 * 60 * 1000;

var actualTemp, message_ui, minTempPlus, maxTempMinus, intervalMinus;

var maxTemp = 30;
var minTemp = 10;

var svg, container, path, lineFunc, scaleX, scaleY, axisX, axisY, gridX, gridY, actualTempLabel;
var margin = { top: 20, right: 20, bottom: 30, left: 50 }

//---  MESSAGES OUTPUT
message_ui = d3.select('.messages');

d3.json(url, function(error, json) {
  if (error) {

    throw error

    message_ui.text('Actual temperature is not available');

  } else {


    actualTemp = Math.round(json.main.temp);


    data = [{
      time: now.toDate(),
      temperature: actualTemp,
    }]

    chart(data);
    animateChart();


    if (actualTemp < minTemp || actualTemp > maxTemp) {
      message_ui.text('The current temperature is out of range, try changing the settings');
    }

    /* ----------------------- 
        UI INTERACTIONS:
     -------------------------- */

    //--- TIME INTERVAL BUTTONS
    var interval_ui = d3.select('.interval');

    interval_ui.select('.value')
      .text((timeInterval_ms / 1000) + ''');

    intervalMinus = interval_ui.select('.minus')
      .on('click', function() {

        if (timeInterval_ms > 1000) {
          timeInterval_ms -= 1000;
        } else {
          d3.select(this)
            .classed('hide', true);
        }

        interval_ui.select('.value')
          .text((timeInterval_ms / 1000) + ''');
      });

    interval_ui.select('.plus')
      .on('click', function() {

        intervalMinus.classed('hide', false);

        timeInterval_ms += 1000;

        interval_ui.select('.value')
          .text((timeInterval_ms / 1000) + ''');

      });

    //---MAX TEMPERATURE BUTTONS

    var maxTemp_ui = d3.select('.max-temp');

    maxTemp_ui.select('.value')
      .text(maxTemp + '°');

    maxTempMinus = maxTemp_ui.select('.minus')
      .on('click', function() {

        if (maxTemp > minTemp + 1) {
          maxTemp -= 1;
        } else {
          d3.select(this)
            .classed('hide', true);
        }

        maxTemp_ui.select('.value')
          .text(maxTemp + '°');

        updateChart(data);

      });

    maxTemp_ui.select('.plus')
      .on('click', function() {

        maxTempMinus
          .classed('hide', false);

        maxTemp += 1;
        maxTemp_ui.select('.value')
          .text(maxTemp + '°');

        updateChart(data);
      });
    //---MIN TEMPERATURE BUTTONS

    var minTemp_ui = d3.select('.min-temp');

    minTemp_ui.select('.value')
      .text(minTemp + '°');

    minTemp_ui.select('.minus')
      .on('click', function() {

        minTempPlus
          .classed('hide', false);

        minTemp -= 1;
        minTemp_ui.select('.value')
          .text(minTemp + '°');

        updateChart(data);

      });

    minTempPlus = minTemp_ui.select('.plus')
      .on('click', function() {
        if (minTemp + 1 < maxTemp) {
          minTemp += 1;

        } else {
          d3.select(this)
            .classed('hide', true);
        }
        minTemp_ui.select('.value')
          .text(minTemp + '°');

        updateChart(data)
      });

  }


});


var then = moment();

function animateChart() {
  animation = requestAnimationFrame(animateChart);

  var nowAnimate = moment();
  elapsed = nowAnimate - then;

  if (elapsed > timeInterval_ms) {
    then = nowAnimate - (elapsed % timeInterval_ms);

    actualTemp = getRnd(maxTemp, minTemp);
    data.push({
      time: now.add(timeInterval_ms / 1000, 's').toDate(),
      temperature: actualTemp
    });

    updateChart(data);

  }
}

function updateChart(data) {

  //--- CREATE SVG
  svg
    .attr('width', parseInt(d3.select('#chart').style('width')))
    .attr('height', 300);

  //--- CHART SIZES & MARGINS
  var width = +svg.attr('width') - margin.left - margin.right;
  var height = +svg.attr('height') - margin.top - margin.bottom;

  //--- CREATE CONTAINER
  container
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //--- SCALE X FUNCTION
  var moment1 = moment().subtract(rangeTime_ms, 'ms').toDate();
  var moment2 = moment().toDate();

  scaleX
    .domain([moment1, moment2])
    .rangeRound([0, width]);

  //--- SCALE Y FUNCTION
  scaleY
    .domain([minTemp, maxTemp]);

  //--- CREATE X AXIS 
  axisX
    .call(
      d3.axisBottom(scaleX)

    );

  //--- CREATE Y AXIS 
  axisY
    .call(
      d3.axisLeft(scaleY)
      .ticks(5)
      .tickFormat(function(d, i) {
        return d + '°'
      })
    );

  //--- CREATE PATH
  path
    .transition()
    .attr('d', lineFunc)
    .style('stroke-width', function() {
      return data.length === 1 ? '3px' : '1px';
    })

  //--- CREATE GRID X LINES
  gridX
    .call(
      d3.axisBottom(scaleX)
      .ticks(5)
      .tickSize(-height)
      .tickFormat('')
    )

  //--- CREATE GRID Y LINES
  gridY
    .call(
      d3.axisLeft(scaleY)
      .ticks(5)
      .tickSize(-width)
      .tickFormat('')
    )

  actualTempLabel.text(Math.round(actualTemp) + '°');

  message_ui
      .classed('hide', true)
      .text('');
}

function chart(data) {

  //--- CREATE SVG
  svg = d3.select('#chart')
    .append('svg')
    .attr('width', parseInt(d3.select('#chart').style('width')))
    .attr('height', 300);

  //--- CHART SIZES & MARGINS
  var width = +svg.attr('width') - margin.left - margin.right;
  var height = +svg.attr('height') - margin.top - margin.bottom;

  //--- CREATE CONTAINER
  container = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  container.append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  var moment1 = moment().subtract(rangeTime_ms, 'ms').toDate();
  var moment2 = moment().toDate();

  scaleX = d3.scaleTime()
    .domain([moment1, moment2])
    .rangeRound([0, width]);

  //--- SCALE Y FUNCTION
  scaleY = d3.scaleLinear()
    .domain([minTemp, maxTemp])
    .rangeRound([height, 0]);

  //--- LINE FUNTION
  lineFunc = d3.line()
    .x(function(d) { return scaleX(d.time); })
    .y(function(d) { return scaleY(d.temperature); });

  //--- CREATE X AXIS TIMES
  axisX = container.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.axisBottom(scaleX)
    )
  //--- CREATE Y AXIS 
  axisY = container.append('g')
    .attr('class', 'axis')
    .call(
      d3.axisLeft(scaleY)
      .ticks(5)
      .tickFormat(function(d, i) {
        return d + '°'
      })
    );
  //--- CREATE PATH
  path = container.append('path')
    .datum(data)
    .attr('class', 'path')
    .attr('d', lineFunc)
    .style('stroke-width', '5');

  path.attr('clip-path', 'url(#clip)');
  //--- CREATE GRID X LINES
  gridX = svg.append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
    .call(
      d3.axisBottom(scaleX)
      .ticks(5)
      .tickSize(-height)
      .tickFormat('')
    )

  //--- CREATE GRID Y LINES
  gridY = svg.append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(
      d3.axisLeft(scaleY)
      .ticks(5)
      .tickSize(-width)
      .tickFormat('')
    )
  //---- ACTUAL TEMPERATURE
  actualTempLabel = d3.select('.actual-temp')
    .select('.value')
    .text(actualTemp + '°');


  window.onresize = function(event) {
    updateChart(data);
  };
}


function getRnd(max, min) {
  return Math.random() * (max - min) + min;
}