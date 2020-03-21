function loadDataTable(filters) {

    let href = '/woodmoney/chart?' + $.param(filters);
    $("#view-chart").attr("href", href);

    console.log(JSON.stringify(filters));
    $.ajax({
        url: "/woodmoney/data",
        type: 'POST',
        data : JSON.stringify(filters),
        contentType: 'application/json',
        success: function (data) {
            console.log("data", data);

            $("#puckiq").html(renderTable(data.results, filters));

            if(data.results.length === 0){
                $("#table-footer").html("No results");
            } else {
                let filter_str = $.param(filters);
                let href = "";
                if (filters.player) {
                    href += `/players/${filters.player}/download?${filter_str}`;
                } else {
                    href = `/woodmoney/download?${filter_str}`;
                }
                $("#table-footer").html(`<a href="${href}" class="x-download">download csv</a>`);
            }

            if(filters.player){
                console.log("todo update header");
            }

            setTimeout(function(){
                initDatatable(data.request);
                initHorizontalScroll($('#table-container'));
            }, 1);
        },
        error: function() {
            //todo
        }
    });

}

function initHorizontalScroll($container) {

    let $table_obj = $("#puckiq");

    //get count fixed collumns params
    var count_fixed_collumns = parseInt($table_obj.attr('data-count-fixed-columns'));

    if (count_fixed_collumns < 1) return;

    //get wrapper object
    var wrapper_obj = $container.find('.scrollable-container');
    var wrapper_left_margin = 0;

    var table_collumns_width = new Array();
    var table_collumns_margin = new Array();

    //calculate wrapper margin and fixed column width
    $table_obj.find("th").each(function (index) {
        if (index < count_fixed_collumns) {
            wrapper_left_margin += $(this).outerWidth();
            table_collumns_width[index] = $(this).outerWidth();
        }
    });

    //calculate margin for each column
    $.each(table_collumns_width, function (key, value) {
        if (key === 0) {
            table_collumns_margin[key] = wrapper_left_margin;
        } else {
            var next_margin = 0;
            $.each(table_collumns_width, function (key_next, value_next) {
                if (key_next < key) {
                    next_margin += value_next;
                }
            });

            table_collumns_margin[key] = wrapper_left_margin - next_margin;
        }
    });

    //set wrapper margin
    if (wrapper_left_margin > 0) {
        wrapper_obj.css('cssText', 'margin-left:' + wrapper_left_margin + 'px !important; width: auto')
    }

    //set position for fixed columns
    $table_obj.find("tr").each(function () {

        //get current row height
        var current_row_height = $(this).outerHeight();

        $('th,td', $(this)).each(function (index) {

            //set row height for all cells
            $(this).css('height', current_row_height);

            //set position
            if (index < count_fixed_collumns) {
                $(this).css('position', 'absolute')
                    .css('margin-left', '-' + table_collumns_margin[index] + 'px')
                    .css('width', table_collumns_width[index]);

                $(this).addClass('table-fixed-cell')
            }
        })
    })
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
    // if($sort && $sort.length) {
    //     base_sort.push($sort[0].cellIndex);
    //     options.sortList = [[$sort[0].cellIndex, 1]];
    // }

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

    html += renderTableHeader(filters);

    for (var i = 0; i < results.length; i++) {
        html += renderTableRow(results[i], filters);
    }

    html += "</tbody>";

    return html;
}

function renderTableHeader(filters){

    var html = `<thead>
    <tr>`;

    if(!filters.player) {
        html += `<th>Player</th><th>Pos</th>`;
    } else {
        html += "<th>Season</th>";
    }

    if(!filters.team) {
        html += `<th>Team</th>`;
    }

    html += `<th data-sort="games_played">GP</th>
        <th data-sorter="false">Comp</th>
        <th data-sorter="false">GT</th>
        <th data-sort="evtoi">TOI</th>

        <th data-sort="ctoipct">CTOI%</th>
        <th data-sort="cf">CF</th>
        <th data-sort="ca">CA</th>
        <th data-sort="cfpct">CF%</th>
        <th data-sort="cf60">CF/60</th>

        <th data-sort="ca60">CA/60</th>
        <th data-sort="cf60rc">CF60RC</th>
        <th data-sort="ca60rc">CA60RC</th>
        <th data-sort="cfpctrc">CF%RC</th>
        <th data-sort="dff">DFF</th>

        <th data-sort="dfa">DFA</th>
        <th data-sort="dffpct">DFF%</th>
        <th data-sort="dff60">DFF/60</th>
        <th data-sort="dfa60">DFA/60</th>
        <th data-sort="dff60rc">DFF60RC</th>

        <th data-sort="dfa60rc">DFA60RC</th>
        <th data-sort="dffpctrc">DFF%RC</th>
        <th data-sort="gf">GF</th>
        <th data-sort="ga">GA</th>
        <th data-sort="gfpct">GF%</th>

        <th data-sort="gfpct">ONSH%</th>
        <th data-sort="gfpct">ONSV%</th>
        <th data-sort="gfpct">PDO</th>
        <th data-sort="gf60">GF/60</th>
        <th data-sort="ga60">GA/60</th>

        <th data-sort="ozspct">OZS%</th>
        <th data-sort="fo60">FO/60</th>
        </tr>
        </thead>`;

    return html;

}

function renderTableRow(playerData, filters) {

    var pd = playerData;

    var html = `<tr>`;

    if(!filters.player) {
        html += `<td style="white-space: nowrap;"><a href="/players/${pd.player_id}">${pd.name}</a></td>
            <td>${pd.position}</td>`;
    } else {
        html += `<td>${pd.season || 'all'}</td>`
    }

    if(!filters.team) {
        if (pd.team) {
            html += `<td><a href="/teams/${pd.team}">${pd.team}</a></td>`;
        } else {
            html += `<td>all</td>`;
        }
    }

    html += `<td>${pd.games_played}</td>
    <td>${pd.woodmoneytier}</td>
    <td>All</td>
    <td>${formatDecimal(pd.evtoi, 2)}</td>

    <td>${formatDecimal(pd.ctoipct, 1)}</td>
    <td>${formatDecimal(pd.cf, 0 )}</td>
    <td>${formatDecimal(pd.ca, 0)}</td>
    <td>${formatDecimal(pd.cfpct)}</td>
    <td>${formatDecimal(pd.cf60, 1)}</td>

    <td>${formatDecimal(pd.ca60, 1)}</td>
    <td>${formatDecimal(pd.cf60rc)}</td>
    <td>${formatDecimal(pd.ca60rc)}</td>
    <td>${formatDecimal(pd.cfpctrc)}</td>
    <td>${formatDecimal(pd.dff)}</td>

    <td>${formatDecimal(pd.dfa)}</td>
    <td>${formatDecimal(pd.dffpct)}</td>
    <td>${formatDecimal(pd.dff60, 1)}</td>
    <td>${formatDecimal(pd.dfa60, 1)}</td>
    <td>${formatDecimal(pd.dff60rc)}</td>

    <td>${formatDecimal(pd.dfa60rc)}</td>
    <td>${formatDecimal(pd.dffpctrc)}</td>
    <td>${pd.gf}</td>
    <td>${pd.ga}</td>
    <td>${formatDecimal(pd.gfpct)}</td>

    <td>${formatDecimal(pd.onshpct, 1)}</td>
    <td>${formatDecimal(pd.onsvpct, 1)}</td>
    <td>${formatDecimal(pd.pdo, 0)}</td>
    <td>${formatDecimal(pd.gf60)}</td>
    <td>${formatDecimal(pd.ga60)}</td>

    <td>${formatDecimal(pd.ozspct)}</td>
    <td>${formatDecimal(pd.fo60)}</td>
        </tr>`;

    return html;

}