const fs = require('fs');
const axios = require('axios');
const { locations } = require('./locations');

// const today = new Date().toISOString().slice(0, 10);
// const forgottenDate = '2021-08-13';

function writeData(date) {
  let dataPoints = [];

  Promise.all(
    locations.map(async (obj) => {
      const location = obj.location;
      const coords = obj.coords.split(',');

      const response = await axios.get(
        `https://api.sunrise-sunset.org/json?lat=${coords[0]}&lng=${coords[1]}&date=${date}`
      );
      const dayLength = response.data.results.day_length;
      const dayLengthSecs = computeDayLengthSeconds(dayLength);

      dataPoints.push(`${date},"${location}",${dayLength},${dayLengthSecs}`);
    })
  )
    .then(() => {
      fs.appendFile('./data/data.csv', `\n${dataPoints.join('\n')}`, (err) => {
        if (err) throw err;
        console.log('Successfully saved the new data to the file!');
      });
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function computeDayLengthSeconds(dayLength) {
  if (dayLength === '00:00:00') return 86400;

  const lengthParts = dayLength.split(':');
  return +lengthParts[0] * 60 * 60 + +lengthParts[1] * 60 + +lengthParts[2];
}

function getNextDay() {
  let i = 0;

  const interval = setInterval(function () {
    if (i < 1) {
      var tomorrow = new Date('2021-12-21');
      tomorrow.setDate(tomorrow.getDate() + i);

      writeData(tomorrow.toISOString().slice(0, 10));

      i++;
    } else {
      clearInterval(interval);
    }
  }, 3500);
}

getNextDay();
