$(document).ready(function() {
    new addAutoComplete($('#player-search'), $('.x-player-results'));
});

$(".x-teams-dropdown").click(function(e) {

    let filters = (getFilters && getFilters('team-menu')) || {};
    if(!filters.positions) delete filters.positions;
    if(filters.season === 'all') delete filters.season;
    if(filters.team || filters.team === '') delete filters.team;
    if(filters.player || filters.player === '') delete filters.player;

    var page_type = $(e.target).attr('data-type');

    $('.x-teams-dropdown-options a').each(function (index, e) {
        let $target = $(e);
        let href = '/' + page_type + '?team=' + $target.attr('data-team')  + '&' + $.param(filters);
        $target.attr("href", href);
    });

});

$(".navbar-item.has-dropdown").click(function(e) {
    if ($(".navbar-burger").is(':visible')) {
        $(this).toggleClass("is-active");
    }
});

$(".navbar-item > .navbar-link").click(function(e) {
    if ($(".navbar-burger").is(':visible')) {
        e.preventDefault();
    }
});

$(".navbar-burger").click(function(){
    let $nav = $("#puckiq-nav");
    if($nav.hasClass("is-active")){
        $nav.removeClass("is-active");
        $nav.css('margin-left', '-50px');
    } else {
        $nav.addClass("is-active");
        $nav.css('margin-left', '-0');
    }
});

function onResize() {
    if (!$(".navbar-burger").is(':visible') && $(".navbar-item.has-dropdown.is-active").length) {
        $(".navbar-item.has-dropdown.is-active").removeClass('is-active');
    }
}

$(window).resize(function(e) {
    onResize();
});

setTimeout(function(){
    onResize();
}, 200);

