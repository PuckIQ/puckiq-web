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
                    suggestedMin: 20,
                    suggestedMax: 80
                }
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

setTimeout(function(){
    submitForm();
}, 10);