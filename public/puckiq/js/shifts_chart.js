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
                    labelString: ""
                },
                ticks: {
                    stepSize : 10,
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
var _filters = {};

function loadChart(filters) {

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
        url: "/shifts/chart",
        type: 'POST',
        data : JSON.stringify(chart_options),
        contentType: 'application/json',
        success: function (data) {
            _idMap = data.chart.id_map;
            _filters = filters;
            updateChart(data.chart);
        },
        error: function() {
            //todo
        }
    });

}

function updateChart(data) {

    chart.data.datasets.shift();
    chart.data.datasets.shift();

    chart.data.datasets.push(data.datasets[0]);
    chart.data.datasets.push(data.datasets[1]);

    chart.config.options.scales.yAxes[0].scaleLabel.labelString = data.y_axis_name;

    if (data.y_axis === 'toipct_diff') {
        chart.config.options.scales.yAxes[0].ticks.suggestedMin = -30;
        chart.config.options.scales.yAxes[0].ticks.suggestedMax = 30;
    } else {
        chart.config.options.scales.yAxes[0].ticks.suggestedMin = 20;
        chart.config.options.scales.yAxes[0].ticks.suggestedMax = 70;
    }

    if (data.x_axis === 'fo60') {
        chart.config.options.scales.xAxes[0].ticks.suggestedMin = 0;
        chart.config.options.scales.xAxes[0].ticks.suggestedMax = 70;
    } else {
        chart.config.options.scales.xAxes[0].ticks.suggestedMin = 30;
        chart.config.options.scales.xAxes[0].ticks.suggestedMax = 70;
    }

    chart.update();

}

function loadPlayerInfo(player_data) {

    return console.log("todo");

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
        case 'fo60':
            hi = 7;
            break;
    }

    let $playerInfo = $("#player-info");
    $playerInfo.hide();

    let all = player_data[0];

    let toi_game = (x) => {
        if(!x.games_played) return 0;
        return formatDecimal(x.evtoi/x.games_played);
    };

    let html = `<h4>${all.name} <small>${all.position}`;

    if (all.team) {
        html += `, ${all.team}`;
    }

    //if(_filters.season === '' || _filters.season === 'all' && all.season) {
    var seas = all.season.toString();
    html += ` (${seas.substr(2,2) + "-" + seas.substr(6,2)})`;
    //}

    html += `</small></h4>
        <div style="">Games Played: ${all.games_played}</div>
        <div style="">Total Min: ${formatDecimal(all.evtoi, 2)}</div>
        <div style="padding-bottom: 10px;">TOI/Game: ${toi_game(all)}</div>
        <table>
    <thead>
    <tr>
    <th>Comp</th>
    <th>TOI%</th>
    <th class="${2 === hi ? 'highlight' : ''}">CF%</th>
    <th>CF%RC</th>
    <th class="${4 === hi ? 'highlight' : ''}">DFF%</th>
    <th>DFF%RC</th>
    <th class="${6 === hi ? 'highlight' : ''}">GF%</th>
    <th class="${7 === hi ? 'highlight' : ''}">FO/60</th>
    </tr>
    </thead>
    <tbody>`;

    _.each(player_data, (pd) => {
        html += `<tr><td>${pd.woodmoneytier}</td>
        <td>${formatDecimal(pd.ctoipct, 1)}</td>
        <td class="${2 === hi ? 'highlight' : ''}">${formatDecimal(pd.cfpct, 1)}</td>
        <td>${formatDecimal(pd.cfpctrc, 2)}</td>
        <td class="${4 === hi ? 'highlight' : ''}">${formatDecimal(pd.dffpct, 1)}</td>
        <td>${formatDecimal(pd.dffpctrc, 2)}</td>
        <td class="${6 === hi ? 'highlight' : ''}">${formatDecimal(pd.gfpct, 1)}</td>
        <td class="${7 === hi ? 'highlight' : ''}">${formatDecimal(pd.fo60, 1)}</td>
        </tr>`;
    });

    html += '</tbody></table>';

    $playerInfo.html(html);
    $playerInfo.fadeIn();

}

$(function() {

    $('#x-axis').change(function () {
        submitForm();
    });

    let show_chart = localStorage.getItem("puckiq-show-chart");

    if (show_chart === null) {
        show_chart = "true";
        localStorage.setItem('puckiq-show-chart', show_chart);
    }

    if (show_chart === 'true') {
        $('.x-toggle-chart').html("Hide Chart");
        $("#woodmoney-visual").show();
        $("#chart-preference").attr("checked","checked");
    } else {
        $('.x-toggle-chart').html("Show Chart");
    }

    $('.x-toggle-chart').click(function (e) {
        var $target = $(e.target);
        if ($target.html() === 'Show Chart') {
            $("#woodmoney-visual").show();
            $target.html("Hide Chart");
        } else {
            $("#woodmoney-visual").hide();
            $target.html("Show Chart");
        }
    });

    $("#chart-preference").change(function (e) {
        if ($("#chart-preference").is(":checked")) {
            console.log("updating chart preference", true);
            localStorage.setItem('puckiq-show-chart', "true");
        } else {
            console.log("updating chart preference", false);
            localStorage.setItem('puckiq-show-chart', "false");
        }
    });

});