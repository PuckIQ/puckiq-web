function getFilters(source) {

    var season = $('form.x-wm-filters [name=season]').val();
    var from_date = $('form.x-wm-filters #from_date').val();
    var to_date = $('form.x-wm-filters #to_date').val();

    var filters = {
        season: season
    };

    if(source === 'team-menu') {
        console.log("filters (shortout)", filters);
        return filters;
    }

    var player = parseInt($('form.x-wm-filters .x-player').val());
    var teammate = parseInt($('form.x-wm-filters .x-teammate').val());

    if(!isNaN(player)) filters.player = player;
    if(!isNaN(teammate)) filters.teammate = teammate;

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

function updateSeasonOnPageRender(season) {

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

    $('#season-input').val(season);
    $('#season-input').css('visibility', 'visible');

    $('.x-change-date-range').click(function(e){
        $('.x-date-error').hide();
        showModal();
        return false;
    });
}

function submitForm(clearSeason){
    console.log('submitting form...', clearSeason);
    $('form.x-wm-filters').submit();
}

$(function() {

    var options = {
        widgets           : ['zebra','columns','stickyHeaders'],
        widgetOptions: {
            stickyHeaders_attachTo : null
        }
    };

    var $sort = $("#puckiq thead tr th[data-sort='" + wmState.request.sort + "']");

    //sorting done server side atm (SS)
    $("#puckiq").tablesorter(options); //.bind("sortEnd", refreshTableStyles);

    // this is a to highlight the sortable column since the sort order is grouped by player its not
    // supported (moved server side)
    if($sort && $sort.length){
        let cell_index = $sort[0].cellIndex;
        $("#puckiq tbody tr td:nth-child(" + (cell_index + 1) + ")").addClass("primary");
    }

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

    updateSeasonOnPageRender(wmState.request.season);

    $( ".x-date-range" ).datepicker({});

    $( ".x-change-player" ).click(function(e){
        $('.x-player-info').hide();
        $('.x-select-player').show();
        return false;
    });

    $( ".x-change-teammate" ).click(function(e){
        $('.x-teammate-info').hide();
        $('.x-select-teammate').show();
        return false;
    });

    if(wmState.request && wmState.request.from_date && wmState.request.to_date) {
        console.log('setting from_date and to_date', wmState.request.from_date, wmState.request.to_date);
        $("#from_date").val(wmState.request.from_date);
        $("#to_date").val(wmState.request.to_date);
        $("#dp-from").datepicker("setDate", new Date(wmState.request.from_date));
        $("#dp-to").datepicker("setDate", new Date(wmState.request.to_date));
    }
});