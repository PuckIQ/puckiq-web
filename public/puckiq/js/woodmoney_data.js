function loadDataTable(filters) {

    let href = '/woodmoney/chart?' + $.param(filters);
    $("#view-chart").attr("href", href);

    $(".x-loader").addClass("is-active");
    $(".x-no-results").hide();
    $(".x-data-container").hide();

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

            let data_columns = [
                "games_played",
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

            var left_column_html = buildLeftColumn(left_columns, data.results, false)
            $(".x-puckiq-left").html(left_column_html);

            var header_html = buildRightHeader(data_columns);
            $(".x-puckiq-header").html(header_html);

            var stats_html = "";
            _.each(data.results, (res) => {
                stats_html += buildRow(data_columns, res);
            });
            $(".x-puckiq-data").html(stats_html);

            $(".x-loader").removeClass("is-active");

            if(data.results.length === 0) {
                $(".x-no-results").show();
            } else {
                $(".x-data-container").show();

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

                // console.log("setting left width", width);
                let $left_column = $('.x-puckiq-left');
                $left_column.css('flex', `0 0 ${width}px`);
                $left_column.css('width', `${width}px`);

                let sort_index = data_columns.indexOf(data.request.sort)+1;
                if(sort_index < 0) {
                    sort_index = left_columns.indexOf(data.request.sort)+1;
                    $('.x-puckiq-left div span:nth-child(' + sort_index + ')').addClass('sort-column');
                } else {
                    $('.x-puckiq-header div:nth-child(' + sort_index + ')').addClass('sort-column');
                    $('.x-puckiq-data .row div:nth-child(' + sort_index + ')').addClass('sort-column');
                }

                $(".sortable").click(function(e){

                    let new_sort = $(e.target).attr('data-sort')
                    let dir = 'desc';
                    if(new_sort === data.request.sort) {
                        dir = data.request.sort_direction === 'desc' ? 'asc' : 'desc';
                    }
                    $('.x-wm-filters input#sort').val(new_sort);
                    $('.x-wm-filters input#sort_direction').val(dir);

                    submitForm(false);
                });

            }, 20);
        },
        error: function(e) {
            console.log("Error occurred", e)
        }
    });

}
