(function () {
  var wWidth = window.innerWidth;
  var parseTime = d3.timeParse('%Y-%m-%d');
  var margin = { top: 10, right: 160, bottom: 30, left: 30 };
  var width =
    wWidth > 900
      ? 900 - margin.left - margin.right
      : wWidth - margin.left - margin.right;
  var height =
    wWidth > 900
      ? 900 - margin.top - margin.bottom
      : 600 - margin.top - margin.bottom;
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10); // schemeSet3 || schemePaired

  var lineChart = d3
    .select('#line-chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var dayAgo = d3
    .select('#day-ago')
    .append('svg')
    .attr('width', 150 + margin.left + margin.right)
    .attr('height', 260 + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + 0 + ',' + margin.top + ')');

  var weekAgo = d3
    .select('#week-ago')
    .append('svg')
    .attr('width', 150 + margin.left + margin.right)
    .attr('height', 260 + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + 0 + ',' + margin.top + ')');

  var monthAgo = d3
    .select('#month-ago')
    .append('svg')
    .attr('width', 150 + margin.left + margin.right)
    .attr('height', 260 + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + 0 + ',' + margin.top + ')');

  d3.csv('./data/data.csv', function (data) {
    var series = d3
      .nest()
      .key(function (d) {
        return d.location; // data is grouped by location
      })
      .entries(data);

    var xAxis = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return parseTime(d.date);
        })
      )
      // .nice()
      .range([0, width]);

    lineChart
      .append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xAxis).ticks(5));

    var yAxis = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return +d.dayLengthSeconds / 3600 + 1;
        }),
      ])
      .rangeRound([height, 0]);

    lineChart.append('g').attr('class', 'axis').call(d3.axisLeft(yAxis));

    const line = d3
      .line()
      .x(function (d) {
        return xAxis(parseTime(d.date));
      })
      .y(function (d) {
        return yAxis(+d.dayLengthSeconds / 3600);
      });

    const seasonChanges = lineChart.append('g');
    const lines = lineChart.selectAll('lines').data(series).enter().append('g');

    lines
      .append('path')
      .attr('class', 'line')
      .attr('stroke', function (d) {
        return colorScale(d.key);
      })
      .attr('d', function (d) {
        return line(d.values);
      });

    // lines
    //   .selectAll('data-points')
    //   .data(function (d) {
    //     return d.values;
    //   })
    //   .enter()
    //   .append('circle')
    //   .attr('class', 'data-point')
    //   .attr('r', 1.75)
    //   .attr('fill', function (d) {
    //     return colorScale(d.location);
    //   })
    //   .attr('cx', function (d) {
    //     return xAxis(parseTime(d.date)) + 0;
    //   })
    //   .attr('cy', function (d) {
    //     return yAxis(+d.dayLengthSeconds / 3600);
    //   });

    lines
      .append('text')
      .sort(function (a, b) {
        return d3.descending(
          +a.values[a.values.length - 1].dayLengthSeconds,
          +b.values[b.values.length - 1].dayLengthSeconds
        );
      })
      .attr('class', 'series-label')
      .attr('transform', function (d, i) {
        var latestDataPoint = d.values[d.values.length - 1];

        return (
          'translate(' +
          xAxis(parseTime(latestDataPoint.date)) +
          ',' +
          (i * 17 + 200) + // (yAxis(+latestDataPoint.dayLengthSeconds / 3600) + 3.5) +
          ')'
        );
      })
      .attr('x', 10)
      .text(function (d) {
        return d.key;
      })
      .attr('fill', function (d) {
        return colorScale(d.key);
      });

    seasonChanges
      .append('line')
      .attr('x1', xAxis(parseTime('2020-12-21')) + 0.75)
      .attr('y1', 0)
      .attr('x2', xAxis(parseTime('2020-12-21')) + 0.75)
      .attr('y2', height)
      .style('stroke-width', 0.5)
      .style('stroke', 'gray')
      .style('fill', 'none');

    seasonChanges
      .append('text')
      .style('text-anchor', 'end')
      .attr('class', 'season-label')
      .attr('transform', function () {
        return (
          'translate(' +
          (xAxis(parseTime('2020-12-21')) + 5) +
          ',' +
          (height - 50) +
          ')rotate(90)'
        );
      })
      .text('Winter solstice');

    seasonChanges
      .append('line')
      .attr('x1', xAxis(parseTime('2021-03-19')) + 0.75)
      .attr('y1', 0)
      .attr('x2', xAxis(parseTime('2021-03-19')) + 0.75)
      .attr('y2', height)
      .style('stroke-width', 0.5)
      .style('stroke', 'gray')
      .style('fill', 'none');

    seasonChanges
      .append('text')
      .style('text-anchor', 'end')
      .attr('class', 'season-label')
      .attr('transform', function () {
        return (
          'translate(' +
          (xAxis(parseTime('2021-03-19')) + 5) +
          ',' +
          (height - 50) +
          ')rotate(90)'
        );
      })
      .text('Spring equinox');

    buildSmallMultiple(dayAgo, 1, series);
    buildSmallMultiple(weekAgo, 7, series);
    buildSmallMultiple(monthAgo, 30, series);
  });

  function buildSmallMultiple(svgRef, timeAgo, series) {
    const bars = svgRef.selectAll('bars').data(series).enter().append('g');

    bars
      .append('text')
      .datum(function (d) {
        var today = d.values[d.values.length - 1];
        var baseline = d.values[d.values.length - (timeAgo + 1)];
        var pctChange =
          ((today.dayLengthSeconds - baseline.dayLengthSeconds) /
            baseline.dayLengthSeconds) *
          100;

        return {
          key: d.key,
          pctChange: isNaN(pctChange) ? 0 : pctChange,
        };
      })
      .sort(function (a, b) {
        return d3.descending(a.pctChange, b.pctChange);
      })
      .text(function (d) {
        return d.key + ': ' + d.pctChange.toFixed(2) + '%';
      })
      .attr('transform', function (d, i) {
        return 'translate(0,' + i * 25 + ')';
      });
  }
})();
