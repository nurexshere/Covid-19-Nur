var dailyWorldData = new Array();

var apiUrls = [
  "https://api.covid19api.com/summary",
  "https://api.covid19api.com/country/ethiopia",
  "https://api.covid19api.com/country/ethiopia",
]

var charts = [
  {
    url: apiUrls[0],
    chart: "chart1",
    title: "Global COVID-19 Cases",
    type: "bar",
  },
  {
    url: apiUrls[1],
    chart: "chart2",
    title: "COVID-19 Cases in Ethiopia",
    type: "doughnut",
  },
  {
    url: apiUrls[2],
    chart: "chart3",
    title: "COVID-19 Cases Timeline in Ethiopia",
    type: "line",
    dateFormat: "YYYY-MM-DD",
   
  },
  
];

charts.forEach(function (chart) {
  fetch(chart.url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var labels = [];
      var values = [];
      var backgroundColors = [];
      var borderColors = [];

      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }
      
      if (chart.url === apiUrls[0]) {
        shuffleArray(data.Countries);
        data.Countries.slice(0, 10).forEach(function (country) {
          labels.push(country.Country);
          values.push(country.TotalConfirmed);
          backgroundColors.push(getRandomColor());
          borderColors.push(getRandomColor());
        });
      }
      
      
      
       else if (chart.url === apiUrls[1]) {
        labels.push("Confirmed", "Recovered", "Deaths");
        values.push(data.All.confirmed, data.All.recovered, data.All.deaths);

        backgroundColors.push("#F44336", "#4CAF50", "#607D8B");
        borderColors.push("#F44336", "#4CAF50", "#607D8B");
      } else if (chart.url === apiUrls[2]) {
        labels.push("Confirmed", "Recovered", "Deaths");
        // Get data for first three months of 2021
        values.push(
          data.MonthlySummaries.slice(0, 3).reduce((acc, cur) => acc + cur.confirmed, 0),
          data.MonthlySummaries.slice(0, 3).reduce((acc, cur) => acc + cur.recovered, 0),
          data.MonthlySummaries.slice(0, 3).reduce((acc, cur) => acc + cur.deaths, 0)
        );
        backgroundColors.push("#F44336", "#4CAF50", "#607D8B");
        borderColors.push("#F44336", "#4CAF50", "#607D8B");
   
      }

      

      var chartData = {
        labels: labels,
        datasets: [
          {
            label: chart.title,
            data: values,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      };

      var ethiopiaTimelineChart = charts[2];
      fetch(ethiopiaTimelineChart.url)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data)
          var labels = [];
          var values = [];
          var backgroundColors = [];
          var borderColors = [];

          var daysToSkip = 7;
          for (var i = 0; i < data.length; i += daysToSkip) {
            var day = data[i];
            labels.push(day.Date.substr(0, 10));
            values.push(day.Confirmed);
            backgroundColors.push(getRandomColor());
            borderColors.push(getRandomColor());
          }

          var chartData = {
            labels: labels,
            datasets: [
              {
                label: ethiopiaTimelineChart.title,
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
              },
            ],
          };
          var chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
          };

          var ctx = document
            .getElementById(ethiopiaTimelineChart.chart)
            .getContext("2d");
          var myChart = new Chart(ctx, {
            type: ethiopiaTimelineChart.type,
            data: chartData,
            options: chartOptions,
          });
        })
        .catch(function (error) {
          console.log("Error fetching data: ", error);
        });

      var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
      };

      var ctx = document.getElementById(chart.chart).getContext("2d");
      var myChart = new Chart(ctx, {
        type: chart.type,
        data: chartData,
        options: chartOptions,
      });
    })
    .catch(function (error) {
      console.log("Error fetching data: ", error);
    });
});

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var dailydata = new Array();
var sum = 0;

function search() {
  let card = `   
  
  <figure class="highcharts-figure">
    <div id="container"></div>
</figure>`;

  document.getElementById("updated").innerHTML = card;
  var inputsearch = document.getElementById("search-input").value;
  alert(inputsearch);
  fetch(`https://api.covid19api.com/dayone/country/${inputsearch}`)
    .then((response) => response.json())
    .then((countrySummary) => {
      for (let i = 0; i < countrySummary.length; i++) {
        let comfirmed = 0;
        comfirmed = countrySummary[i].Confirmed;
        dailydata.push(comfirmed - sum);
        sum = comfirmed;
      }

      Highcharts.chart("container", {
        title: {
          text: "Daily Case",
        },

        xAxis: {
          tickInterval: 1,
          type: "logarithmic",
          accessibility: {
            rangeDescription: "Range: 1 to 10",
          },
        },

        yAxis: {
          type: "logarithmic",
          minorTickInterval: 0.1,
          accessibility: {
            rangeDescription: "Range: 0.1 to 1000",
          },
        },

        tooltip: {
          headerFormat: "<b>{series.name}</b><br />",
          pointFormat: "x = {point.x}, y = {point.y}",
        },

        series: [
          {
            data: [],
            pointStart: 1,
          },
        ],
      });
      function updateChart() {
        let chart = Highcharts.charts[1];
        chart.series[0].setData(dailydata);
      }
      updateChart();
    });
}

fetch(
  "https://api.covid19api.com/world?from=2020-03-01T00:00:00Z&to=2023-04-01T00:00:00Z"
)
  .then((response) => response.json())
  .then((worldDaily) => {
    for (let i = 0; i < worldDaily.length; i++) {
      let total = worldDaily[i].TotalConfirmed;
      dailyWorldData.push(Number(total));
    }

    // Data retrieved https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
    Highcharts.chart("chart111", {
      chart: {
        type: "spline",
      },
      title: {
        text: "",
      },
      subtitle: {
        text:
          "Source: " +
          '<a href="https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature" ' +
          'target="_blank">Wikipedia.com</a>',
      },
      xAxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        accessibility: {
          description: "Months of the year",
        },
      },
      yAxis: {
        title: {
          text: "No: of People",
        },
        labels: {
          formatter: function () {
            return this.value + "°";
          },
        },
      },
      tooltip: {
        crosshairs: true,
        shared: true,
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 4,
            lineColor: "#666666",
            lineWidth: 1,
          },
        },
      },
      series: [
        {
          name: "Case",
          marker: {
            symbol: "square",
          },
          data: [1, 2, 4],
        },
      ],
    });

    function updateChart() {
        let chart = Highcharts.charts[0];
        chart.series[0].setData(dailyWorldData);
      }
      updateChart();
  })
  .catch((err) => console.error(err));


  fetch('https://disease.sh/v3/covid-19/countries?sort=cases')
  .then(response => response.json())
  .then(data => {
    let tableBody = document.querySelector('#covidTable tbody');
    data.slice(0, 40).forEach(country => {
      let row = document.createElement('tr');
      row.innerHTML = `
        <td>${country.country}</td>
        <td>${country.cases}</td>
        <td>${country.deaths}</td>
        <td>${country.recovered}</td>
        <td>${country.active}</td>
      `;
      tableBody.appendChild(row);
    });
  });

  
