## Description

This repository is the answer to a front-end challenge for a job application at Snuk. 

The task consist in build a temperature control that shows the last 30 minutes of Berlin weather data in a linear chart. This interactive chart also include controls that allow the user change the temperature range and also the frequency in which the data is being updated.

## Technical decisions

I decided to work with D3 library because this library allows create  an interactive linear chart in SVG that can be customizable in a very low level.

For time operations a used moment.js because makes things easier.

I decide not to use any framework for the visual aspects because I don’t want to load libraries that bring a lot of unnecessary code, so I made a simple design and I wrote only the CSS necessary for this interface in particular.

If I would have more time for the development, I would improve the UX, include a loader before the chart is being rendered and add a “reset settings” button. 

I only used D3.js for the development, but If I had time I would have done this interface with React and D3. I am not an expertise in React, 
I need time to do some research of how D3 and React can work together.

## What’s next

If these project were real probably I would test these interface in differents devices and browsers, implement another controls that allows the user to modify the time range and improve the accessibility including some settings to change the visual aspect of the interface like for example contrast. 

And finally I would improve the way that I wrote this code, doing it more reusable and maintainable. 
