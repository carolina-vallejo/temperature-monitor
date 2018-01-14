var App = (function() {

  /* ----------------------- 
      VARIABLES
   -------------------------- */

  //-- TEMPERATURE VARIABLES
  var actualTemp,
    maxTemp = 30,
    minTemp = 10;

  //-- TIME VARIABLES
  var now = moment();
  var timeInterval_ms = 30000;
  var rangeTime_ms = 30 * 60 * 1000;

  //-- DATA VARIABLE
  var data;

  //-- LINE CHART VARIABLE
  var lineChart;

  /* ----------------------- 
      MESSAGES OUTPUT
   -------------------------- */
  var message_ui = d3.select('.messages');

  /* ----------------------------
      LOAD DATA FROM WEATHER API
   -------------------------- */

  var cityID = 2950159,
    appid = '1c052ccd7090e7a17d2da2f5a1e661cb',
    url = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&appid=' + appid + '&units=metric';

  d3.json(url, function(error, json) {
    if (error) {
      throw error

      message_ui
        .classed('hide', false)
        .text('The current temperature of Berlin is not available');

    } else {

      /* -------------------------------
          STORE REAL ACTUAL TEMPERATURE
       ------------------------------ */

      actualTemp = Math.round(json.main.temp);

      data = [{
        time: now.toDate(),
        temperature: actualTemp,
      }];

      /* ----------------------- 
          DRAW LINE CHART
       -------------------------- */

      lineChart = new LineChart({
        element: document.getElementById('chart'),
        data: data
      });

      /* ----------------------- 
           UI BUTTONS
        -------------------------- */
      var uiSettingsButtons = new UiButtons();


      /* ----------------------- 
           ADD NEW DATA ANIMATION
        -------------------------- */

      addNewdata();

      /* ----------------------- 
          RESIZE EVENT
       -------------------------- */

      window.onresize = function(event) {
        lineChart.resizeLineChart();
      };

      /* ----------------------- 
          MESSAGE IF TEMPERATURE 
          IS OUT OF RANGE
       -------------------------- */
      if (actualTemp < minTemp || actualTemp > maxTemp) {

        message_ui
          .classed('hide', false)
          .text('The current temperature is out of range, try changing the settings');
      }

    }
  });

  /* ----------------------- 
    LINE CHART
   -------------------------- */

  var LineChart = function(opts) {

    // LOAD ARGUMENTS 
    this.data = opts.data;
    this.element = opts.element;

    // CREATE CHART
    this.draw();
  }

  LineChart.prototype.draw = function() {

    //-- DEFINE WIDTH, HEIGHT
    this.svgWidth = this.element.offsetWidth;
    this.svgHeight = 300;
    //---MARGIN
    this.m = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
    };

    this.width = this.svgWidth - this.m.left - this.m.right;
    this.height = this.svgHeight - this.m.top - this.m.bottom;

    //-- CREATE SVG
    this.svg = d3.select(this.element).append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);

    //-- CREATE CONTAINER
    this.container = this.svg.append('g')
      .attr('transform', 'translate(' + this.m.left + ',' + this.m.top + ')');


    //-- DEFINE SCALE FUNCTIONS
    this.scaleX = d3.scaleTime();
    //--- SCALE Y FUNCTION
    this.scaleY = d3.scaleLinear();
    //-- DEFINE LINE FUNCTION   
    this.lineFunc = d3.line();


    //-- CREATE AXES OBJECTS
    this.axisX = this.container.append('g')
      .attr('class', 'axis');
    this.axisY = this.container.append('g')
      .attr('class', 'axis');

    //-- CREATE CLIP PATH
    this.clippath = this.container.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);

    //--- CREATE PATH
    this.path = this.container.append('path')
      .attr('class', 'path')
      .attr('clip-path', 'url(#clip)')
      .style("stroke-width", '3');

    //--- CREATE GRID X LINES
    this.gridX = this.svg.append('g')
      .attr('class', 'grid');

    //--- CREATE GRID Y LINES
    this.gridY = this.svg.append('g')
      .attr('class', 'grid');

    this.actualTempLabel = d3.select('.actual-temp')
      .select('.value')
      .text(actualTemp + '°');

    //-- INIT SCALES, AXES, GRID, PATH
    this.updateLineChart();

  }

  LineChart.prototype.configScales = function() {

    //--- RANGE: NOW UNTIL LAST 30 MINS.
    var moment1 = moment().subtract(rangeTime_ms, 'ms').toDate();
    var moment2 = moment().toDate();

    this.scaleX
      .domain([moment1, moment2])
      .rangeRound([0, this.width]);

    //--- SCALE Y FUNCTION
    this.scaleY
      .domain([minTemp, maxTemp])
      .rangeRound([this.height, 0]);

  }

  LineChart.prototype.configAxes = function() {
    //--- CREATE X AXIS TIMES
    this.axisX
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(
        d3.axisBottom(this.scaleX)
      )
    //--- CREATE Y AXIS 
    this.axisY
      .call(
        d3.axisLeft(this.scaleY)
        .ticks(5)
        .tickFormat(function(d, i) {
          return d + '°'
        })
      );
  }

  LineChart.prototype.configPath = function() {
    var _this = this;

    this.lineFunc
      .x(function(d) {
        return _this.scaleX(d.time);
      })
      .y(function(d) {
        return _this.scaleY(d.temperature);
      });

    //--- CREATE PATH
    this.path
      .datum(data)
      .transition()
      .attr("d", this.lineFunc)
      .style("stroke-width", function() {
        return data.length === 1 ? '3px' : '1px';
      })

  }

  LineChart.prototype.configGrid = function() {
    var _this = this;
    //--- CREATE GRID X LINES
    this.gridX
      .attr('transform', 'translate(' + this.m.left + ',' + (this.height + this.m.top) + ')')
      .call(
        d3.axisBottom(_this.scaleX)
        .ticks(5)
        .tickSize(-_this.height)
        .tickFormat('')
      );

    //--- CREATE GRID Y LINES
    this.gridY
      .attr('transform', 'translate(' + this.m.left + ',' + this.m.top + ')')
      .call(
        d3.axisLeft(_this.scaleY)
        .ticks(5)
        .tickSize(-_this.width)
        .tickFormat('')
      );
  }

  LineChart.prototype.updateTextLabel = function() {
    this.actualTempLabel
      .text(actualTemp + '°');
  }

  LineChart.prototype.updateLineChart = function() {

    //-- INIT SCALES, AXES, GRID, PATH
    this.configScales();
    this.configAxes();
    this.configPath();
    this.configGrid();
    this.updateTextLabel();

    //---HIDE/SHOW MESSAGE OUT OF RANGE
    if (actualTemp < minTemp || actualTemp > maxTemp) {
      message_ui
        .classed('hide', false)
        .text('The current temperature is out of range, try changing the settings');
    } else {
      message_ui
        .classed('hide', true);
    }
  }

  LineChart.prototype.resizeLineChart = function() {
    //-- UPDATE WIDTH
    this.svgWidth = this.element.offsetWidth;
    this.width = this.svgWidth - this.m.left - this.m.right;

    this.svg
      .attr('width', this.svgWidth);

    this.clippath
      .attr('width', this.width);

    this.updateLineChart();

  }
  /* ----------------------- 
    UI BUTTONS
   -------------------------- */

  var UiButtons = function() {

    this.interval_ui(d3.select('#interval'));
    this.minTemp_ui(d3.select('#min-temp'));
    this.maxTemp_ui(d3.select('#max-temp'));

  }

  UiButtons.prototype.interval_ui = function(element) {

    //--- SELECT INTERNAL UI ELEMENT
    var valueElement = element.select('.value');
    var minusElement = element.select('.minus');
    var plusElement = element.select('.plus');

    //--- WRITE ACTUAL VALUE OF INTERVAL
    valueElement
      .text((timeInterval_ms / 1000) + '"');

    //--- ON CLICK EVENTS
    minusElement
      .on('click', function() {

        if (timeInterval_ms > 1000) {
          timeInterval_ms -= 1000;
        } else {
          d3.select(this)
            .classed('hide', true);
        }

        valueElement
          .text((timeInterval_ms / 1000) + '"');

      });

    plusElement
      .on('click', function() {

        minusElement.classed('hide', false);

        timeInterval_ms += 1000;

        valueElement
          .text((timeInterval_ms / 1000) + '"');

      });
  }
  UiButtons.prototype.minTemp_ui = function(element) {

    //--- SELECT INTERNAL UI ELEMENT

    var valueElement = element.select('.value');
    var minusElement = element.select('.minus');
    var plusElement = element.select('.plus');

    //--- WRITE ACTUAL VALUE OF INTERVAL
    valueElement
      .text(minTemp + '°');

    //--- ON CLICK EVENTS
    minusElement
      .on('click', function() {

        plusElement
          .classed('hide', false);

        minTemp -= 1;

        valueElement
          .text(minTemp + '°');

        lineChart.updateLineChart();

      });

    plusElement
      .on('click', function() {

        if (minTemp + 1 < maxTemp) {
          minTemp += 1;
        } else {
          d3.select(this)
            .classed('hide', true);
        }

        valueElement
          .text(minTemp + '°');

        lineChart.updateLineChart();

      });
  }
  UiButtons.prototype.maxTemp_ui = function(element) {

    //--- SELECT INTERNAL UI ELEMENT
    var valueElement = element.select('.value');
    var minusElement = element.select('.minus');
    var plusElement = element.select('.plus');

    //--- WRITE ACTUAL VALUE OF INTERVAL
    valueElement
      .text(maxTemp + '°');

    //--- ON CLICK EVENTS
    minusElement
      .on('click', function() {

        if (maxTemp > minTemp + 1) {
          maxTemp -= 1;
        } else {
          d3.select(this)
            .classed('hide', true);
        }

        valueElement
          .text(maxTemp + '°');

        lineChart.updateLineChart();

      });

    plusElement
      .on('click', function() {

        minusElement
          .classed('hide', false);

        maxTemp += 1;

        valueElement
          .text(maxTemp + '°');

        lineChart.updateLineChart();

      });
  }
  /* ----------------------- 
    ADD NEW DATA ANIMATED
   -------------------------- */
  var elapsed, then = moment();

  function addNewdata() {

    window.requestAnimationFrame(addNewdata);

    var nowAnimate = moment();
    elapsed = nowAnimate - then;

    if (elapsed > timeInterval_ms) {
      then = nowAnimate - (elapsed % timeInterval_ms);

      actualTemp = Math.round(getRnd(maxTemp, minTemp));

      data.push({
        time: now.add(timeInterval_ms / 1000, 's').toDate(),
        temperature: actualTemp
      });

      lineChart.updateLineChart();

    }
  }

  /* ----------------------- 
    AUXILIARY FUNCTION
   -------------------------- */
  function getRnd(max, min) {
    return Math.random() * (max - min) + min;
  }

})();