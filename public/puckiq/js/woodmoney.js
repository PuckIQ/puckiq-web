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
    var team = $('form.x-wm-filters #team').val();

    var filters = {
        season: season,
        tier: tier,
        positions: positions,
        team: team,
        min_toi: parseInt(min_toi),
        max_toi: parseInt(max_toi)
    };

    if(isNaN(filters.min_toi)) delete filters.min_toi;
    if(isNaN(filters.max_toi)) delete filters.max_toi;

    if(!season && from_date && to_date) {
        filters.from_date = new Date(parseInt(from_date)).getTime();
        filters.to_date = new Date(parseInt(to_date)).getTime();
    }

    console.log("filters", filters);
    return filters;
}

function showModal(){

    console.log("showing modal");
    let filters = getFilters();
    if(!filters.season && !filters.from_date && !filters.to_date) {
        console.log('defaulting from_date and to_date');
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        $("#dp-to").datepicker("setDate", today);
        $("#to_date").val(today.getTime());
    }

    $('#date-range-modal').modal({});
}

function changeQueryString(val) {
    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + val;
        window.history.pushState({path: newurl}, '', newurl);
    }
}

function submitForm(){

    var filters = getFilters();
    var keys = Object.keys(filters);
    var tmp = [];
    for(var i=0; i < keys.length; i++){
        var key = keys[i];
        if(filters[key] !== null && filters[key] !== '') tmp.push(key + "=" + encodeURIComponent(filters[key]));
    }
    var query_string = tmp.join("&");
    changeQueryString(query_string);

    if(wmState.is_chart){

        $.post( "/woodmoney/chart", filters, function( data ) {

            console.log(data);

            chart.data.datasets.shift();
            chart.data.datasets.shift();

            chart.data.datasets.push(data.datasets[0]);
            chart.data.datasets.push(data.datasets[1]);

            chart.update();

        });

    } else {

    }

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

    $('#season-input').change(function () {
        var newSeason = $('#season-input').val();
        if (newSeason === '') {
            showModal();
        } else {
            $("#from_date").val('');
            $("#to_date").val('');
            submitForm();
        }
    });

    $(".x-positions").change(onPositionsChange);
    $("#pos-f").change(onForwardChange);
    $(".x-date-range").change(function(e) {
        let $target = $(e.target);
        let val = $target.val();
        if (val) {
            let year = parseInt(val.substr(6, 4));
            let month = parseInt(val.substr(0, 2));
            let day = parseInt(val.substr(3, 2));
            if (year > 0 && month > 0 && day > 0) {
                let dt = new Date(year, month - 1, day);
                $("#" + $target.attr("data-target")).val(dt.getTime());
            }
        }
    });

    $(".x-woodmoney-submit").click(function(){
        submitForm(false);
    });

    $(".x-date-range-submit").click(function(){

        let dt_from = $("#from_date").val();
        let dt_to = $("#to_date").val();

        console.log(new Date(parseInt(dt_from)), new Date(parseInt(dt_to)));
        if(new Date(parseInt(dt_from)) >= new Date(parseInt(dt_to))){
            $('.x-date-error').html("From date cannot be greater than to date");
            $('.x-date-error').show();
        } else {
            $('.x-date-error').hide();
            submitForm(true);
        }
    });

    $('.x-change-date-range').click(function(e){
        $('.x-date-error').hide();
        showModal();
        return false;
    });

    $('#season-input').val(wmState.request.season);
    $('#season-input').css('visibility', 'visible');

    $( ".x-date-range" ).datepicker({});

    if(wmState.request && wmState.request.from_date && wmState.request.to_date) {
        console.log('setting from_date and to_date', wmState.request.from_date, wmState.request.to_date);
        $("#from_date").val(wmState.request.from_date);
        $("#to_date").val(wmState.request.to_date);
        $("#dp-from").datepicker("setDate", new Date(wmState.request.from_date));
        $("#dp-to").datepicker("setDate", new Date(wmState.request.to_date));
    }
});