function getFilters() {

    var season = $('form.x-wm-filters [name=season]').val();
    var tier = $('form.x-wm-filters #competition').val();

    var positions = null;
    if ($('form.x-wm-filters [name=positions]').length) {
        positions = $('form.x-wm-filters [name=positions]:checkbox:checked').map(function () {
            return $(this).val();
        }).get();
        if (positions.length === 4) {
            positions = 'all';
        } else {
            positions = positions.join('');
        }
    }

    return {season: season, tier: tier, positions: positions};
}

function refreshTableFiltering() {

    // var tier = $('#competition').val();
    // var positions = $('[name=positions]:checkbox:checked').map(function() { return $(this).val(); }).get();
    //
    // $('#puckiq tbody tr').addClass('hidden');
    //
    // let classes_to_show = [];
    // $.each(["l","r","c","d"], function(index, x) {
    //     if (!!~positions.indexOf(x)) {
    //         if (tier) {
    //             classes_to_show.push({pos: x, tier: tier});
    //         } else {
    //             classes_to_show.push({pos: x});
    //         }
    //     }
    // });
    //
    // $.each(classes_to_show, function(index, cls) {
    //     if (cls.tier) {
    //         console.log('#puckiq tbody tr.pos-' + cls.tier + ', #puckiq tbody tr.woodmoney-' + tier);
    //         $('#puckiq tbody tr.pos-' + cls.pos + '.woodmoney-' + tier).removeClass('hidden');
    //     } else {
    //         $('#puckiq tbody tr.pos-' + cls.pos).removeClass('hidden');
    //     }
    // });
    //
    // refreshTableStyles();

    // let filters = {
    //     tier: tier,
    //     positions: positions
    // };
    //
    // $('.x-download').attr('href', wmState.base_download_url + '?' + $.param(filters));
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
        url = url.replace(/season=\d+/, 'season=' + seasonId)
    } else {
        url += (url.indexOf('season=') == -1) ? '?' : '&'
        url += 'season=' + seasonId
    }
    return url
}

function onPositionsChange() {
    var forwardPosSelected = $('#pos-c:checked, #pos-l:checked, #pos-r:checked').length;
    $('#pos-f').prop('checked', forwardPosSelected == 3);
}

function onForwardChange() {
    var fSelected = $('#pos-f').is(':checked');
    $('#pos-c,#pos-l,#pos-r').prop('checked', fSelected);
}

$(function() {

    $("#puckiq").tablesorter({
        //sortList: [[0,0]],
        // sortInitialOrder  : 'desc',
        widgets           : ['columns'],
    }).bind("sortEnd", refreshTableStyles)

    $("[name=positions]").change(onPositionsChange);
    $("#pos-f").change(onForwardChange);

    $("#competition").change(refreshTableFiltering);
    $("[name=positions]").change(refreshTableFiltering);
    $("#pos-f").change(refreshTableFiltering);

    updateSeasonOnPageRender(wmState.request.season);
    refreshTableFiltering();

});