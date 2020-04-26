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

    // if(!season && from_date && to_date) {
    //     filters.from_date = new Date(parseInt(from_date)).getTime();
    //     filters.to_date = new Date(parseInt(to_date)).getTime();
    // }

    console.log("filters", filters);
    return filters;
}

function changeQueryString(val) {
    console.log("changing query string2", val);
    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + val;
        window.history.pushState({path: newurl}, '', newurl);
    }
}

function submitForm(initial_load) {

    var filters = getFilters();
    var keys = Object.keys(filters);
    var tmp = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (filters[key] !== null && filters[key] !== '') tmp.push(key + "=" + encodeURIComponent(filters[key]));
    }

    if (!initial_load) {
        var query_string = tmp.join("&");
        console.log("changing query string", filters);
        changeQueryString(query_string);
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
    $("#shift_type").change(function(e) {
        let shift_type = $(e.target).val();
        if (shift_type) {
            $("#y-axis").val(shift_type);
        }
    });

    $(".x-woodmoney-submit").click(function(){
        submitForm(false);
    });

    if($("#group_by").val() === 'team_season'){
        $("#woodmoney-visual").hide();
    }

    setTimeout(function () {
        submitForm(true);
    }, 10);

});

function loadDataTable(filters) {

    console.log(JSON.stringify(filters));
    $.ajax({
        url: "/shifts/data",
        type: 'POST',
        data : JSON.stringify(filters),
        contentType: 'application/json',
        success: function (data) {

            $("#puckiq").html(renderTable(data.results, filters));

            if(data.results.length === 0){
                $("#table-footer").html("No results");
            } else {

                let filter_str = $.param(filters);
                let href = "";
                if (filters.player) {
                    href += `/players/${filters.player}/download?${filter_str}`;
                } else {
                    href = `/shifts/download?${filter_str}`;
                }
                $("#table-footer").html(`<a href="${href}" class="x-download">download csv</a>`);
            }

            if(filters.player){
                console.log("todo update header");
            }

            setTimeout(function(){
                initDatatable(data.request);
            }, 1);
        },
        error: function() {
            //todo
        }
    });

}

function initDatatable(request) {

    var options = {
        //sortInitialOrder  : 'desc',
        widgets: ['zebra', 'columns', 'stickyHeaders'],
        widgetOptions: {
            stickyHeaders_attachTo: null
        }
    };

    var $sort = $("#puckiq thead tr th[data-sort='" + request.sort + "']");

    $("#puckiq").tablesorter(options); //.bind("sortEnd", refreshTableStyles);

    var resort = true;
    var callback = function() {
        //nothing required
    };

    $("#puckiq").trigger("updateAll", [ resort, callback ]);

    if ($sort && $sort.length) {
        let cell_index = $sort[0].cellIndex;
        $("#puckiq tbody tr td:nth-child(" + (cell_index + 1) + ")").addClass("primary");
    }
}

function renderTable(results, filters) {

    var html = `<tbody id="dataTable">`;

    var is_team_view = filters.group_by === 'team_season';

    html += renderTableHeader(filters, is_team_view);

    for (var i = 0; i < results.length; i++) {
        html += renderTableRow(results[i], filters, is_team_view);
    }

    html += "</tbody>";

    return html;
}

function renderTableHeader(filters, is_team_view){

    var html = `<thead>
    <tr>`;

    if((filters.seasons && filters.seasons.length > 1) || filters.player) {
        html += `<th data-sorter="false">Season</th>`;
    }

    if(!is_team_view && !filters.player) {
        html += `<th data-sorter="false">Player</th><th data-sorter="false" >Pos</th>`;
    }

    if(!filters.team) {
        html += `<th rowspan="2"  data-sorter="false">Team</th>`;
    }

    html += `<th data-sorter="true" style="text-align: center;">Shift Type</th>`;
    html += `<th data-sorter="true" style="text-align: center;">Shifts</th>`;
    html += `<th data-sorter="true" style="text-align: center;">TOI (min)</th>`;
    html += `<th data-sorter="true" style="text-align: center;">Shift Start %</th>`;
    html += `<th data-sorter="true" style="text-align: center;">GF</th>`;
    html += `<th data-sorter="true" style="text-align: center;">GA</th>`;
    html += `<th data-sorter="true" style="text-align: center;">GF60</th>`;
    html += `<th data-sorter="true" style="text-align: center;">GA60</th>`;
    html += `<th data-sorter="true" style="text-align: center;">GF%</th>`;
    html += `<th data-sorter="true" style="text-align: center;">CF</th>`;
    html += `<th data-sorter="true" style="text-align: center;">CA</th>`;
    html += `<th data-sorter="true" style="text-align: center;">CF60</th>`;
    html += `<th data-sorter="true" style="text-align: center;">CA60</th>`;
    html += `<th data-sorter="true" style="text-align: center;">CF%</th>`;
    html += `<th data-sorter="true" style="text-align: center;">DFF</th>`;
    html += `<th data-sorter="true" style="text-align: center;">DFA</th>`;
    html += `<th data-sorter="true" style="text-align: center;">DFF60</th>`;
    html += `<th data-sorter="true" style="text-align: center;">DFA60</th>`;
    html += `<th data-sorter="true" style="text-align: center;">DFF%</th>`;
    html += `<th data-sorter="true" style="text-align: center;">AVG Shift (s)</th>`;
    html += `</tr></thead>`;

    return html;

}

function renderTableRow(playerData, filters, is_team_view) {

    var pd = playerData;

    var html = `<tr>`;

    if((filters.seasons && filters.seasons.length > 1) || filters.player) {
        html += `<td>${pd._id && (pd._id.season || 'all')}</td>`;
    }

    if(!is_team_view && !filters.player) {
        html += `<td style="white-space: nowrap;"><a href="/players/${pd._id.player_id}">${pd.name}</a></td>
            <td>${pd.position}</td>`;
    }

    if(!filters.team) {
        if (pd.team) {
            html += `<td><a href="/teams/${pd.team}">${pd.team}</a></td>`;
        } else {
            html += `<td>all</td>`;
        }
    }

    html += `<td>${pd.shift_type}</td>
<td>${formatDecimal(pd.shifts, 0)}</td>
<td>${formatDecimal(pd.toi, 0)}</td>
<td>${formatDecimal(pd.shift_pct, 1)}</td>
<td>${formatDecimal(pd.gf, 0)}</td>
<td>${formatDecimal(pd.ga, 0)}</td>
<td>${formatDecimal(pd.gf60, 1)}</td>
<td>${formatDecimal(pd.ga60, 1)}</td>
<td>${formatDecimal(pd.gf_pct, 1)}</td>
<td>${formatDecimal(pd.cf, 0)}</td>
<td>${formatDecimal(pd.ca, 0)}</td>
<td>${formatDecimal(pd.cf60, 1)}</td>
<td>${formatDecimal(pd.ca60, 1)}</td>
<td>${formatDecimal(pd.cf_pct, 1)}</td>
<td>${formatDecimal(pd.dff, 0)}</td>
<td>${formatDecimal(pd.dfa, 0)}</td>
<td>${formatDecimal(pd.dff60, 1)}</td>
<td>${formatDecimal(pd.dfa60, 1)}</td>
<td>${formatDecimal(pd.dff_pct, 1)}</td>
<td>${formatDecimal(pd.avgshift, 2)}</td>`;

    html += `</tr>`;

    return html;

}