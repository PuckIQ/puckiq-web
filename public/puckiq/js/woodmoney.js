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
    var from_date = $('form.x-wm-filters #from_date').val();
    var to_date = $('form.x-wm-filters #to_date').val();

    return {
        season: season,
        tier: tier,
        positions: positions,
        min_toi: min_toi,
        max_toi: max_toi,
        from_date: from_date,
        to_date: to_date
    };
}

function updateSeasonOnPageRender(season) {

    $('#season-input').change(function () {
        var newSeason = $('#season-input').val();
        if (newSeason === '') {
            console.log("showing modal");
            $('#date-range-modal').modal({});
        } else {
            window.location = redirectToSeason(newSeason);
        }
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

    var $sort = $("#puckiq thead tr th[data-sort='" + wmState.request.sort + "']");
    // if($sort && $sort.length) {
    //     options.sortList = [[$sort[0].cellIndex, 1]];
    // }

    //sorting done server side atm (SS)
    $("#puckiq").tablesorter(options); //.bind("sortEnd", refreshTableStyles);

    // this is a to highlight the sortable column since the sort order is grouped by player its not
    // supported (moved server side)
    if($sort && $sort.length){
        let cell_index = $sort[0].cellIndex;
        $("#puckiq tbody tr td:nth-child(" + (cell_index + 1) + ")").addClass("primary");
    }

    $(".x-positions").change(onPositionsChange);
    $("#pos-f").change(onForwardChange);
    $(".x-date-range").change(function(e) {
        let $target = $(e.target);
        let val = $target.val();
        console.log("change", e.target, val);
        if(val){
            let year = parseInt(val.substr(6,4));
            let month = parseInt(val.substr(0,2));
            let day =parseInt(val.substr(3,2));
            console.log(year,month, day);
            if(year > 0 && month > 0 && day > 0){
                let dt = new Date(year, month-1, day);
                console.log("setting date", "input[name='" + $target.attr("data-target") + "']", $("#" + $target.attr("data-target")), dt.getTime());
                $("#" + $target.attr("data-target")).val(dt.getTime());
            }
        }
    });

    function submitForm(clearSeason){
        console.log('submitting form...', clearSeason);
        // console.log(getFilters());
        // console.log($("input[name='to_date']").val());
        // if(clearSeason) {
        //     $("#season-input").val('');
        // }
        $('form.x-wm-filters').submit();
    }

    $(".x-woodmoney-submit").click(function(){
        submitForm(false);
    });

    $(".x-date-range-submit").click(function(){
        submitForm(true);
    });

    updateSeasonOnPageRender(wmState.request.season);

    $( ".x-date-range" ).datepicker({});
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("today", today);
    $("#dp-to").datepicker("setDate", today);
    $("#to_date").val(today.getTime());
});