$(document).ajaxStart(function () { Pace.restart(); });

var postype = [
  { id: 'D', text: 'D' },
  { id: 'G', text: 'G' },
  { id: 'L', text: 'LW' },
  { id: 'R', text: 'RW' },
  { id: 'C', text: 'C' }
];

var stattype = [
  { id: 'G', text: 'G' },
  { id: 'S', text: 'S' },
  { id: 'C', text: 'C' },
  { id: 'F', text: 'F' },
  { id: 'D', text: 'DF' },
  { id: 'A', text: 'SA' },
  { id: 'Z', text: 'ZS' }
];

$('#pq-player1name, #pq-player2name').select2({
  placeholder: {
    id: -1,
    text: 'Player Name...',
  },
  ajax: {
    url: 'http://api.puckiq.org/puckiq/0/players/getPlayerSearch',
    dataType: 'json',
    delay: 250,
    data: function (params) {
      return {
        fullName: params.term
      }
    },
    processResults: function (data, params) {
      return {
        results: $.map(data, function (item) {
          return {
            text: item.fullName,
            id: item.playerid
          }
        })
      }
    },
    cache: false
  },
  allowClear: true
});

$('#pq-postype').select2({
  placeholder: {
    id: -1,
    text: 'Position...'
  },
  data: postype
});

$('#pq-display').select2({
  placeholder: {
    id: -1,
    text: 'Stat Type...'
  },
  data: stattype,
  allowClear: true
});

$.get('http://localhost:3001/puckiq/h1/seasonwowy/getSeasonList').done(function (data) {
  var seasonlist = new Array();
  for (var i = 0; i < data.length; i++) {
    seasonlist.push({ id: data[i]._id, text: data[i]._id });
  }

  $('#pq-season').select2({
    placeholder: {
      id: -1,
      text: 'Leave blank for all seasons...'
    },
    data: seasonlist,
    allowClear: true
  })
});

$('#pq-daterange').daterangepicker({
  autoUpdateInput: false,
  locale: {
    cancelLabel: 'Clear'
  }
}).on('apply.daterangepicker', function (ev, picker) {
  $(this).val(picker.startDate.format('YYYY-MM-DD') + ' to ' + picker.endDate.format('YYYY-MM-DD'));
  $('#pq-season').prop('disabled', true);
  $('input[name="q1datestart"]').prop('disabled', false).val(picker.startDate.format('YYYY-MM-DD'));
  $('input[name="q1dateend"]').prop('disabled', false).val(picker.endDate.format('YYYY-MM-DD'));
}).on('cancel.daterangepicker', function (ev, picker) {
  $(this).val('');
  $('#pq-season').prop('disabled', false);
  $('input[name="q1datestart"]').val('').prop('disabled', true);
  $('input[name="q1dateend"]').val('').prop('disabled', true);
});

$('#pq-season').on('change', function (ev) {
  if ($(this).val() != "") {
    $('#pq-daterange').prop('disabled', true);
    $('input[name="q1datestart"]').val('').prop('disabled', true);
    $('input[name="q1dateend"]').val('').prop('disabled', true);
  } else {
    $('#pq-daterange').prop('disabled', false);
    $('input[name="q1datestart"]').val('').prop('disabled', true);
    $('input[name="q1dateend"]').val('').prop('disabled', true);
  }
});

$('form').submit(function () {
  var dt = $(this).serializeArray();
  var checkrange = false;

  for (var x = 0; x < dt.length; x++) {
    if (dt[x].name == 'q1datestart')
      checkrange = true;
  }

  var qt = checkrange ? 'player-wowy-range' : 'player-wowy-season';
  var indent = checkrange ? 3 : 4;

  $.ajax({
    url: '/ajax/' + qt + '?' + $(this).serialize(),
    complete: function () {
      $('#pq-wowydata').css('display', 'block');
    },
    beforeSend: function () {
      $('#pq-wowydata').css('display', 'none');
    }
  }).done(function (data) {
    $('#pq-wowydata').html(data);
    $('#pq-1w2 > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc']
    });
    $('#pq-1wo2 > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc']
    });
    $('#pq-2wo1 > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc']
    });
    $('#pq-all > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc']
    });
  });

  return false;
})