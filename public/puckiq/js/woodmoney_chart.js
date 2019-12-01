var data = {
    labels: "todo",
    datasets: [
        {
            label: [],
            backgroundColor: "rgba(255,221,50,0.2)",
            borderColor: "rgba(255,221,50,1)",
            data: []
        }, {
            label: [],
            backgroundColor: "rgba(60,186,159,0.2)",
            borderColor: "rgba(60,186,159,1)",
            data: []
        }
    ]
};

var ctx = document.getElementById('bubble-chart'); //.getContext('2d');
var chart = new Chart(ctx, {
    type: 'bubble',
    data: data,
    options: {
        responsive: true,
        title: { display: false },
        legend : { display : false},
        tooltips: { enabled : false},
        scales: {
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "TODO"
                },
                ticks: {
                    stepSize : 20,
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: "CF%"
                },
                ticks: {
                    stepSize : 50,
                    suggestedMin: 30,
                    suggestedMax: 70
                }
            }]
        },
        onClick: function(e) {

            var element = this.getElementAtEvent(e);

            if (element.length > 0) {
                let arr = _idMap[element[0]._datasetIndex.toString()];
                let index = element[0]._index;
                if(arr.length >= index){
                    var player_data = arr[index];
                    loadPlayerInfo(player_data);
                }
            }
        },
        plugins: {
            datalabels: {
                anchor: function(context) {
                    return 'end';
                    // var value = context.dataset.data[context.dataIndex];
                    // return value.v < 50 ? 'end' : 'center';
                },
                align: function(context) {
                    var value = context.dataset.data[context.dataIndex];
                    return value.v < 50 ? 'end' : 'center';
                },
                color: function(context) {
                    return '#4a5f6d';
                    //return context.dataset.backgroundColor;
                    // var value = context.dataset.data[context.dataIndex];
                    // return value.v < 50 ? context.dataset.backgroundColor : 'white';
                },
                font: {
                    weight: 'normal'
                },
                formatter: function(value, ctx) {
                    return ctx.dataset.labels[ctx.dataIndex];
                },
                offset: 2,
                padding: 0
            }
        }
    }
});

var _idMap = { '0' : [], '1' : []};

function getData(filters) {

    let chart_options = {
        filters,
        options: {
            x_axis: $('#x-axis').val(),
            y_axis: $('#y-axis').val(),
        }
    };

    let href = '/woodmoney/data?' + $.param(filters);
    $("#view-raw-data").attr("href", href);

    $.ajax({
        url: "/woodmoney/chart",
        type: 'POST',
        data : JSON.stringify(chart_options),
        contentType: 'application/json',
        success: function (data) {
            _idMap = data.chart.id_map;
            updateChart(data.chart, chart_options.options);
        },
        error: function() {
            //todo
        }
    });

}

function updateChart(data, chart_options) {

    chart.data.datasets.shift();
    chart.data.datasets.shift();

    chart.data.datasets.push(data.datasets[0]);
    chart.data.datasets.push(data.datasets[1]);

    chart.config.options.scales.yAxes[0].scaleLabel.labelString = data.y_axis;

    if (chart_options['y-axis'] === 'toipct_diff') {
        chart.config.options.scales.yAxes[0].ticks.suggestedMin = -50;
        chart.config.options.scales.yAxes[0].ticks.suggestedMax = 50;
    } else { //} if (chart_options['y-axis'] === ' toipct_elite') {
        chart.config.options.scales.yAxes[0].ticks.suggestedMin = 10;
        chart.config.options.scales.yAxes[0].ticks.suggestedMax = 70;
    }

    chart.update();

}

function loadPlayerInfo(player_data) {

    let x_axis = $('#x-axis').val();

    let hi = -1;
    switch (x_axis) {
        case 'cfpct':
            hi = 2;
            break;
        case 'dffpct':
            hi = 4;
            break;
        case 'gfpct':
            hi = 6;
            break;
    }

    let $playerInfo = $("#player-info");
    $playerInfo.hide();

    let all = player_data[0];

    let toi_game = (x) => {
      if(!x.games_played) return 0;
      return formatDecimal(x.evtoi/x.games_played);
    };

    let html = `<h4>${all.name} <small>${all.position}</small></h4>
        <div style="">Games Played: ${all.games_played}</div>
        <div style="">Total Min: ${formatDecimal(all.evtoi, 2)}</div>
        <div style="padding-bottom: 10px;">TOI/Game: ${toi_game(all)}</div>
        <table>
    <thead>
    <tr>
    <th>Comp</th>
    <th>TOI%</th>
    <th class="${2 === hi ? 'highlight' : ''}">CF%</th>
    <th>CF60RC</th>
    <th class="${4 === hi ? 'highlight' : ''}">DFF%</th>
    <th>DFF60RC</th>
    <th class="${6 === hi ? 'highlight' : ''}">GF%</th>
    </tr>
    </thead>
    <tbody>`;

    _.each(player_data, (pd) => {
        html += `<tr><td>${pd.woodmoneytier}</td>
        <td>${formatDecimal(pd.ctoipct, 1)}</td>
        <td class="${2 === hi ? 'highlight' : ''}">${formatDecimal(pd.cfpct, 2)}</td>
        <td>${formatDecimal(pd.cf60rc, 2)}</td>
        <td class="${4 === hi ? 'highlight' : ''}">${formatDecimal(pd.dffpct, 2)}</td>
        <td>${formatDecimal(pd.dff60rc, 2)}</td>
        <td class="${6 === hi ? 'highlight' : ''}">${formatDecimal(pd.gfpct, 2)}</td></tr>`;
    });

    html += '</tbody></table>';

    $playerInfo.html(html);
    $playerInfo.fadeIn();

}

$(function() {

    console.log("init chart events");

    $('#x-axis').change(function () {
        submitForm();
    });

    setTimeout(function(){
        submitForm(true);
    }, 10);
});