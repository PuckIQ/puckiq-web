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
                    stepSize : 5,
                    suggestedMin: 0,
                    suggestedMax: 50
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: "CF%"
                },
                ticks: {
                    stepSize : 5,
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

    //let href = '/shifts/data?' + $.param(filters);
    //$("#view-raw-data").attr("href", href);

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

    console.log("y_axis_min", data.y_axis_min, "y_axis_max", data.y_axis_max);
    let y_range = null;
    if (data.y_axis === 'otf') {
        y_range = getChartYRange(data, 55, 15);
    } else {
        y_range = getChartYRange(data, 25, 10);
    }
    console.log("y_range.min", y_range.min, "y_range.max", y_range.max);
    chart.config.options.scales.yAxes[0].ticks.suggestedMin = y_range.min;
    chart.config.options.scales.yAxes[0].ticks.suggestedMax = y_range.max;

    console.log("x_axis_min", data.x_axis_min, "x_axis_max", data.x_axis_max);
    let x_range = getChartXRange(data, 50, 10);
    console.log("x_range.min", x_range.min, "x_range.max", x_range.max);
    chart.config.options.scales.xAxes[0].ticks.suggestedMin = x_range.min;
    chart.config.options.scales.xAxes[0].ticks.suggestedMax = x_range.max;

    chart.update();

}

function loadPlayerInfo(player_data) {

    let x_axis = $('#x-axis').val();

    let hi = -1;
    switch (x_axis) {
        case 'cf_pct':
            hi = 3;
            break;
        case 'dff_pct':
            hi = 4;
            break;
        case 'gf_pct':
            hi = 5;
            break;
    }

    let $playerInfo = $("#player-info");
    $playerInfo.hide();

    let all = player_data[0];

    let html = `<h4>${all.name} <small>${all.position}`;

    if (all.team) {
        html += `, ${all.team}`;
    }

    var seas = all._id.season.toString();
    html += ` (${seas.substr(2,2) + "-" + seas.substr(6,2)})`;

    html += `</small></h4>
        <table>
    <thead>
    <tr>
    <th>Shift Type</th>
    <th>TOI (min)</th>
    <th>Shift Start %</th>
    <th class="${3 === hi ? 'highlight' : ''}">CF%</th>
    <th class="${4 === hi ? 'highlight' : ''}">DFF%</th>
    <th class="${5 === hi ? 'highlight' : ''}">GF%</th>
    </tr>
    </thead>
    <tbody>`;

    _.each(player_data, (pd) => {
        html += `<tr>
        <td>${pd.shift_type}</td>
        <td>${formatDecimal(pd.toi, 0)}</td>
        <td>${formatDecimal(pd.shift_pct, 0)}</td>
        <td class="${3 === hi ? 'highlight' : ''}">${formatDecimal(pd.cf_pct, 1)}</td>
        <td class="${4 === hi ? 'highlight' : ''}">${formatDecimal(pd.dff_pct || 0, 1)}</td>
        <td class="${5 === hi ? 'highlight' : ''}">${formatDecimal(pd.gf_pct, 1)}</td>
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

    $('#y-axis').change(function () {
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