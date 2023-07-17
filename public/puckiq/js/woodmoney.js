function getFilters() {

    var season = $('form.x-wm-filters [name=season]').val();
    var tier = $('form.x-wm-filters #tier').val();
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
    var from_date = $('form.x-wm-filters #from_date').val();
    var to_date = $('form.x-wm-filters #to_date').val();
    var team = $('form.x-wm-filters #team').val();
    var sort = $('form.x-wm-filters #sort').val();
    var sort_direction = $('form.x-wm-filters #sort_direction').val();

    var filters = {
        player : $("form.x-wm-filters #player-id").val(),
        season: season,
        tier: tier,
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

    if(!season && from_date && to_date) {
        filters.from_date = new Date(parseInt(from_date)).getTime();
        filters.to_date = new Date(parseInt(to_date)).getTime();
    }

    console.log('getFilters', filters);
    return filters;
}

function showModal(){

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

function submitForm(initial_load) {

    var filters = getFilters();

    var keys = Object.keys(filters);
    var tmp = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (filters[key] !== null && filters[key] !== '') {
            tmp.push(key + "=" + encodeURIComponent(filters[key]));
        }
    }

    if (!initial_load) {
        var query_string = tmp.join("&");
        changeQueryString(query_string);
        updateDateRange(filters);
    }

    loadChart(filters);
    loadDataTable(filters);
}

function updateDateRange(filters) {

    var dateString = function (dt) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (!_.isDate(dt)) {
            dt = new Date(dt);
        }

        return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
    };

    var $ctl = $("#show-date-range");

    if (!(filters.from_date && filters.to_date)) {
        $ctl.hide();
        return;
    } else {

        var from_date_str = dateString(filters.from_date);
        var to_date_str = dateString(filters.to_date);
        var content = from_date_str + " " + to_date_str;
        $ctl.find("span").html(content);
        if(!$ctl.is(":visible")){
            $ctl.show();
        }
    }

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

        // console.log(new Date(parseInt(dt_from)), new Date(parseInt(dt_to)));
        if(new Date(parseInt(dt_from)) >= new Date(parseInt(dt_to))){
            $('.x-date-error').html("From date cannot be greater than to date");
            $('.x-date-error').show();
        } else {
            $('.x-date-error').hide();
            // $('#date-range-modal').modal('hide');
            $.modal.close();
            submitForm(false);
        }
    });

    $('.x-change-date-range').click(function(e){
        $('.x-date-error').hide();
        showModal();
        return false;
    });

    $( ".x-date-range" ).datepicker({});

    if($("#show-date-range").is(":visible")) {
        console.log('setting from_date and to_date', wmState.request.from_date, wmState.request.to_date);
        $("#from_date").val(wmState.request.from_date);
        $("#to_date").val(wmState.request.to_date);
        $("#dp-from").datepicker("setDate", new Date(wmState.request.from_date));
        $("#dp-to").datepicker("setDate", new Date(wmState.request.to_date));
    }

    setTimeout(function () {
        let sort_options = {};
        if(wmState.request.sort) sort_options.sort = wmState.request.sort;
        if(wmState.request.sort_direction) sort_options.sort_direction = wmState.request.sort_direction;
        submitForm(true, sort_options);
    }, 10);

});
