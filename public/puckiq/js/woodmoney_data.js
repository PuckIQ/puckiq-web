function loadDataTable(filters) {

    let href = '/woodmoney/chart?' + $.param(filters);
    $("#view-chart").attr("href", href);

    console.log(JSON.stringify(filters));
    $.ajax({
        url: "/woodmoney/data",
        type: 'POST',
        data: JSON.stringify(filters),
        contentType: 'application/json',
        success: function(data) {
            console.log("data", data);

            let left_columns = filters.player ? ['season'] : ['player','position'];
            if(!filters.team) {
                left_columns.push('team');
            }

            console.log("left columns", left_columns);

            let data_columns = ["games_played",
                "woodmoneytier",
                "game_type",
                "evtoi",

                "ctoipct",
                "cf",
                "ca",
                "cfpct",
                "cf60",

                "ca60",
                "cf60rc",
                "ca60rc",
                "cfpctrc",
                "dff",

                "dfa",
                "dffpct",
                "dff60",
                "dfa60",
                "dff60rc",

                "dfa60rc",
                "dffpctrc",
                "gf",
                "ga",
                "gfpct",

                "onshpct",
                "onsvpct",
                "pdo",
                "gf60",
                "ga60",

                "ozspct",
                "fo60"];

            var left_column_html = buildLeftColumn(left_columns, data.results, filters)
            $(".x-puckiq-left").html(left_column_html);

            var header_html = buildRightHeader(data_columns);
            $(".x-puckiq-header").html(header_html);

            var stats_html = "";
            _.each(data.results, (res) => {
                stats_html += buildRow(data_columns, res);
            });
            $(".x-puckiq-data").html(stats_html);

            if(data.results.length === 0) {
                $(".x-puckiq-container").html("No results");
            } else {
                let filter_str = $.param(filters);
                let href = "";
                if(filters.player) {
                    href += `/players/${filters.player}/download?${filter_str}`;
                } else {
                    href = `/woodmoney/download?${filter_str}`;
                }
                $(".x-download").html(`<a href="${href}" class="x-download">download csv</a>`);
            }

            setTimeout(function() {

                syncscroll.reset();

                // the extra 2 pixels is for the border
                let left_width = 2 + (filters.player ? 70 : 160+60);
                if(!filters.team) left_width += 60;

                console.log("setting left width", left_width);
                let $left_column = $('.x-puckiq-left');
                $left_column.css('flex', `0 0 ${left_width}px`);
                $left_column.css('width', `${left_width}px`);

                console.log("todo hightlight sort column");
                // var $sort = $("#puckiq thead tr th[data-sort='" + request.sort + "']");
                //
                // if ($sort && $sort.length) {
                //     let cell_index = $sort[0].cellIndex;
                //     $("#puckiq tbody tr td:nth-child(" + (cell_index + 1) + ")").addClass("primary");
                // }

            }, 20);
        },
        error: function(e) {
            console.log("Error occurred", e)
        }
    });

}

function buildLeftColumn(columns, results) {

    var html = "<div class='puckiq-header'>";
    _.each(columns, col => {
       html += getFormattedHeader(col, 'span');
    });
    html += "</div>";

    _.each(results, (res) => {
        html += "<div>";
        _.each(columns, col => {
            html += getFormattedColumn(col, res,'span');
        });
        html += "</div>";
    });

    return html;
}

function buildRightHeader(columns){

    var html = "";
    _.each(columns, col => {
        html += getFormattedHeader(col, 'div');
    });
    return html;

}

function buildRow(columns, pd) {

    var html = `<div class="row">`;

    _.each(columns, col => {
        html += getFormattedColumn(col, pd, 'div');
    });
    html += "</div>";

    return html;

}
