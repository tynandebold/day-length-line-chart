const fs = require('fs');
const axios = require('axios');
const { locations } = require('./locations');

const today = new Date().toISOString().slice(0, 10);
// const forgottenDate = '2021-05-23';

function writeData() {
  let dataPoints = [];

  Promise.all(
    locations.map(async (obj) => {
      const location = obj.location;
      const coords = obj.coords.split(',');

      const response = await axios.get(
        `https://api.sunrise-sunset.org/json?lat=${coords[0]}&lng=${coords[1]}`
      );
      const dayLength = response.data.results.day_length;
      console.log(dayLength);
      const dayLengthSecs = computeDayLengthSeconds(dayLength);

      dataPoints.push(`${today},"${location}",${dayLength},${dayLengthSecs}`);
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

writeData();
