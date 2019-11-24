var data = {
    labels: "todo team name",
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
        title: { display: false },
        legend : { display : false},
        tooltips: { enabled : false},
        scales: {
            yAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: "TOI Elite - TOI Grit"
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: "CF%"
                },
                ticks: {
                    suggestedMin: 30,
                    suggestedMax: 70
                },
                // beforeFit: function (scale) {
                //
                //     // See what you can set in scale parameter
                //     console.log(scale);
                //
                //     // Find max value in your dataset
                //     let maxValue = 0;
                //     let maxValue = 0;
                //     if (scale.chart.config && scale.chart.config.data && scale.chart.config.data.datasets) {
                //         scale.chart.config.data.datasets.forEach(dataset => {
                //             if (dataset && dataset.data) {
                //                 dataset.data.forEach(value => {
                //                     if (value > maxValue) {
                //                         maxValue = value
                //                     }
                //                 })
                //             }
                //         })
                //     }
                //
                //     // After, set max option !!!
                //     scale.options.ticks.max = maxValue
                // }
            }]
        },
        plugins: {
            datalabels: {
                anchor: function(context) {
                    var value = context.dataset.data[context.dataIndex];
                    return value.v < 50 ? 'end' : 'center';
                },
                align: function(context) {
                    var value = context.dataset.data[context.dataIndex];
                    return value.v < 50 ? 'end' : 'center';
                },
                color: function(context) {
                    return 'black';
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

function getData(filters){

    let chart_options = {
        filters,
        options : {
            x_axis : '',
            y_axis : '',
        }
    };

    $.post( "/woodmoney/chart", chart_options, function( data ) {
        updateChart(data);
    });

}

function updateChart(data){

    console.log(data);

    chart.data.datasets.shift();
    chart.data.datasets.shift();

    chart.data.datasets.push(data.datasets[0]);
    chart.data.datasets.push(data.datasets[1]);

    // //todo calculate these
    // chart.config.options.scales.yAxes[0].ticks.min = 30;
    // chart.config.options.scales.yAxes[0].ticks.max = 70;

    chart.update();

}

setTimeout(function(){
    submitForm();
}, 10);