const fs = require('fs');

function processSunData () {
  // read initial data
  const data = fs.readFileSync('./2017-sun-data.txt', 'utf8').replace(/\r\n/g, '\n').split('\n').filter(v => v);
  const [initialHeaders, ...rows] = data;
  const headers = initialHeaders.split(' ');
  const initialResult = rows.map(row => {
    const result = {};
    const cells = row.split(' ');
    headers.forEach((h, i) => {
      result[h] = cells[i];
    });
    return result;
  });

  // process data into object split by month
  // each month is then split by day
  // each day has a rise and set entry
  const processedResult = {};
  initialResult.forEach(entry => {
    const { Day: day, ...months } = entry;
    Object.keys(months).forEach(monthEntry => {
      const [monthInt, timeType] = monthEntry.split('-');

      const timeEntry = months[monthEntry];
      const [hours, minutes] = [timeEntry.slice(0, 2), timeEntry.slice(2)];

      const date = new Date(2017, +monthInt, +day, +hours, +minutes);
      if (!processedResult[+monthInt]) {
        processedResult[+monthInt] = {};
      }
      if (!processedResult[+monthInt][+day]) {
        processedResult[+monthInt][+day] = {};
      }
      processedResult[+monthInt][+day][timeType] = date;
    });
  });

  // delete any entries that has the same rise/set time (indication of filler)
  Object.keys(processedResult).forEach(month => {
    Object.keys(processedResult[month]).forEach(day => {
      const { Rise: rise, Set: set } = processedResult[month][day];
      if (rise.valueOf() === set.valueOf()) {
        console.log('deleting filler entry', month, day);
        delete processedResult[month][day];
      }
    });
  });

  // save result
  fs.writeFileSync('./2017-sun-data.json', JSON.stringify(processedResult, null, 2), 'utf8');
}

processSunData();
