function getFilters() {

    var seasons = 'all';
    var $seas = $('#selected-seasons');

    if($seas.length) {
        seasons = $.map($seas.find("div.selected"), function (x) {
            return parseInt($(x).attr('data-season'));
        });
    }

    var shift_type = $('form.x-wm-filters #shift_type').val();
    var group_by = $('form.x-wm-filters #group_by').val();

    var positions = null;
    if ($('form.x-wm-filters .x-positions').length) {
        positions = $('form.x-wm-filters .x-positions:checkbox:checked').map(function () {
            return $(this).val();
        }).get();
        if (positions.length === 4) {
            positions = 'all';
        } else {
            positions = positions.join('');
        }
    }

    var min_toi = $('form.x-wm-filters #min_toi').val();
    var max_toi = $('form.x-wm-filters #max_toi').val();
    // var from_date = $('form.x-wm-filters #from_date').val();
    // var to_date = $('form.x-wm-filters #to_date').val();
    var team = $('form.x-wm-filters #team').val();
    var sort = $('form.x-wm-filters #sort').val();
    var sort_direction = $('form.x-wm-filters #sort_direction').val();

    var filters = {
        player : $("form.x-wm-filters #player-id").val(),
        seasons: seasons,
        shift_type: shift_type,
        positions: positions,
        team: team,
        group_by: group_by,
        min_toi: parseInt(min_toi),
        max_toi: parseInt(max_toi)
    };

    if(isNaN(filters.min_toi)) delete filters.min_toi;
    if(isNaN(filters.max_toi)) delete filters.max_toi;
    if(!filters.positions) delete filters.positions;
    if(!filters.player) delete filters.player;

    if(sort) filters.sort = sort;
    if(sort_direction) filters.sort_direction = sort_direction;

    // if(!season && from_date && to_date) {
    //     filters.from_date = new Date(parseInt(from_date)).getTime();
    //     filters.to_date = new Date(parseInt(to_date)).getTime();
    // }

    console.log("filters", filters);
    return filters;
}

function submitForm(initial_load) {

    var filters = getFilters();

    if (!initial_load) {
        var query_string = encodeObjectForQuery(filters);
        changeQueryString(query_string);
        //updateDateRange(filters);
    }

    loadChart(filters);
    loadDataTable(filters);
}

function onPositionsChange() {
    var forwardPosSelected = $('#pos-c:checked, #pos-l:checked, #pos-r:checked').length;
    $('#pos-f').prop('checked', forwardPosSelected == 3);

    var filters = getFilters();
    $('form.x-wm-filters [name=positions]').val(filters.positions);
}

function onForwardChange() {
    var fSelected = $('#pos-f').is(':checked');
    $('#pos-c,#pos-l,#pos-r').prop('checked', fSelected);
    onPositionsChange();
}

$(function() {

    $('#selected-seasons div').click(function (e) {

        var $seas = $(e.target);

        if($seas.hasClass("selected")){
            $seas.removeClass("selected");
        } else {
            $seas.addClass("selected");
        }
    });

    $(".x-positions").change(onPositionsChange);
    $("#pos-f").change(onForwardChange);

    $(".x-woodmoney-submit").click(function(){
        submitForm(false);
    });

    setTimeout(function () {
        submitForm(true);
    }, 10);

});

function loadDataTable(filters) {

    $(".x-loader").addClass("is-active");
    $(".x-no-results").hide();
    $(".x-data-container").hide();

    $.ajax({
        url: "/shifts/data",
        type: 'POST',
        data: JSON.stringify(filters),
        contentType: 'application/json',
        success: function(data) {
            console.log("data", data);

            // the extra 2 pixels is for the border
            let width = 2;
            let left_columns = [];

            if((filters.seasons && filters.seasons.length > 1) || filters.player) {
                left_columns.push('season');
                width += 70;
            }

            if(!filters.player) {
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
                "shift_type",
                "shifts",
                "toi",
                "toi_per_game",
                "shift_pct",

                "gf",
                "ga",
                "gf60",
                "ga60",
                "gfpct",

                "cf",
                "ca",
                "cf60",
                "ca60",
                "cfpct",

                "dff",
                "dfa",
                "dff60",
                "dfa60",
                "dffpct",

                "avgshift"];

            var left_column_html = buildLeftColumn(left_columns, data.results, filters)
            $(".x-puckiq-left").html(left_column_html);

            var header_html = buildRightHeader(data_columns);
            $(".x-puckiq-header").html(header_html);

            var stats_html = "";
            _.each(data.results, (res) => {
                stats_html += buildRow(data_columns, res);
            });
            $(".x-puckiq-data").html(stats_html);

            if(filters.player) {
                console.log("todo update header");
            }

            $(".x-loader").removeClass("is-active");

            if(data.results.length === 0) {
                $(".x-no-results").show();
            } else {
                $(".x-data-container").show();
            }

            setTimeout(function() {

                syncscroll.reset();

                console.log("setting left width", 2 + width);
                let $left_column = $('.x-puckiq-left');
                $left_column.css('flex', `0 0 ${width}px`);
                $left_column.css('width', `${width}px`);

                let sort_index = data_columns.indexOf(data.request.sort) + 1;
                if(sort_index < 0) {
                    sort_index = left_columns.indexOf(data.request.sort) + 1;
                    $('.x-puckiq-left div span:nth-child(' + sort_index + ')').addClass('sort-column');
                } else {
                    $('.x-puckiq-header div:nth-child(' + sort_index + ')').addClass('sort-column');
                    $('.x-puckiq-data .row div:nth-child(' + sort_index + ')').addClass('sort-column');
                }

                $(".sortable").click(function(e) {

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
        error: function() {
            //todo
        }
    });

}
