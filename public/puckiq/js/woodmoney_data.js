function loadDataTable(filters) {

    let href = '/woodmoney/chart?' + $.param(filters);
    $("#view-chart").attr("href", href);

    $.ajax({
        url: "/woodmoney/data",
        type: 'POST',
        data: JSON.stringify(filters),
        contentType: 'application/json',
        success: function(data) {

            // the extra 2 pixels is for the border
            let width = 2;

            let left_columns = [];
            if(filters.player){
                left_columns.push('season');
                width += 70;
            } else {
                left_columns.push('player');
                left_columns.push('position');
                width += 220; // 160+60
            }

            if(!filters.team) {
                left_columns.push('team');
                width += 60;
            }

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

                console.log("setting left width", width);
                let $left_column = $('.x-puckiq-left');
                $left_column.css('flex', `0 0 ${width}px`);
                $left_column.css('width', `${width}px`);

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
