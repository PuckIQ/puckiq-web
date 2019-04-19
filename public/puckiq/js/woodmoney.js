function getFilters() {

    var season = $('form.x-wm-filters [name=season]').val();
    var tier = $('form.x-wm-filters #tier').val();

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

    return {season: season, tier: tier, positions: positions, min_toi: min_toi, max_toi: max_toi};
}

function refreshTableStyles() {
    $('#puckiq tbody tr:visible td').css('background', '#efefef');
    $('#puckiq tbody tr:visible:even td').css('background', '#d8f0ff');
}

function updateSeasonOnPageRender(season) {
    $('#season-input').change(function () {
        var newSeason = $('#season-input').val();
        window.location = redirectToSeason(newSeason);
    });

    $('#season-input').val(season);
    $('#season-input').css('visibility', 'visible')
}

function redirectToSeason(seasonId) {
    var url = window.location.href;
    if (url.indexOf('season=') > -1) {
        url = url.replace(/season=\d+/, 'season=' + seasonId);
    } else {
        url += (url.indexOf('season=') == -1) ? '?' : '&';
        url += 'season=' + seasonId;
    }
    return url;
}

function onPositionsChange() {
    var forwardPosSelected = $('#pos-c:checked, #pos-l:checked, #pos-r:checked').length;
    $('#pos-f').prop('checked', forwardPosSelected == 3);

    var filters = getFilters();
    console.log("positions changed", filters);

    console.log("updating positions to", filters.positions);
    $('form.x-wm-filters [name=positions]').val(filters.positions);
}

function onForwardChange() {
    var fSelected = $('#pos-f').is(':checked');
    $('#pos-c,#pos-l,#pos-r').prop('checked', fSelected);
    onPositionsChange();
}

$(function() {

    var options = {
        //sortInitialOrder  : 'desc',
        widgets           : ['zebra','columns','stickyHeaders'],
        widgetOptions: {
            stickyHeaders_attachTo : null
        }
    };

    // var $sort = $("#puckiq thead tr th[data-sort='" + wmState.request.sort + "']");
    // if($sort && $sort.length){
    //     options.sortList = [[$sort[0].cellIndex,1]];
    // }

    //sorting done server side atm (SS)
    $("#puckiq").tablesorter(options); //.bind("sortEnd", refreshTableStyles);

    $(".x-positions").change(onPositionsChange);
    $("#pos-f").change(onForwardChange);

    $("#woodmoney-submit").click(function(){
        console.log('submitting form...');
        $('form.x-wm-filters').submit();
    });

    updateSeasonOnPageRender(wmState.request.season);

});