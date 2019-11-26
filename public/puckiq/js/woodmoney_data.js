function getData(filters) {

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
            }, 1);
        },
        error: function() {
            //todo
        }
    });

}

function initDatatable(request){

    var options = {
        //sortInitialOrder  : 'desc',
        widgets: ['zebra', 'columns', 'stickyHeaders'],
        widgetOptions: {
            stickyHeaders_attachTo: null
        }
    };

    var $sort = $("#puckiq thead tr th[data-sort='" + request.sort + "']");
    // if($sort && $sort.length) {
    //     options.sortList = [[$sort[0].cellIndex, 1]];
    // }

    //sorting done server side atm (SS)
    $("#puckiq").tablesorter(options); //.bind("sortEnd", refreshTableStyles);

    // this is a to highlight the sortable column since the sort order is grouped by player its not
    // supported (moved server side)
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

    if(!filters.team){
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
        html += `<td>${pd.season}</td>`
    }

    if(!filters.team){
        html += `<td><a href="/teams/${pd.team}>${pd.team}</a></td>`;
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

function formatDecimal(val, no_decimals) {
    if(isNaN(no_decimals)) no_decimals = 2;
    return parseFloat("" + Math.round(val * 100) / 100).toFixed(no_decimals);
}

$(function() {

    setTimeout(function(){
        submitForm(true);
    }, 10);

});