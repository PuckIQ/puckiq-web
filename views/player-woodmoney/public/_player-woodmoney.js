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

$('#pq-playername').select2({
  placeholder: {
    id: -1,
    text: 'Select Player(s)...',
  },
  minimumInputLength: 2,
  maximumSelectionLength: 6,
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

$.get('http://api.puckiq.org/puckiq/h1/seasonwoodmoney/getSeasonList').done(function (data) {
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

$('#pq-daterange > input[name="q1datestart"]').datetimepicker({
  format: 'YYYY-MM-DD',
  showClear: true
});
$('#pq-daterange > input[name="q1dateend"]').datetimepicker({
  format: 'YYYY-MM-DD',
  showClear: true,
  showTodayButton: true,
  useCurrent: false
});

$('#pq-daterange > input[name="q1datestart"]').on('dp.change', function (e) {
  $('#pq-daterange > input[name="q1dateend"]').data('DateTimePicker').minDate(e.date);
  if ($('#pq-daterange > input[name="q1dateend"]').val() === '')
    $('#pq-season').val('').prop('disabled', false);
  else
    $('#pq-season').val('').prop('disabled', true);
});

$('#pq-daterange > input[name="q1dateend"]').on('dp.change', function (e) {
  $('#pq-daterange > input[name="q1datestart"]').data('DateTimePicker').maxDate(e.date);
  if ($('#pq-daterange > input[name="q1datestart"]').val() === '')
    $('#pq-season').val('').prop('disabled', false);
  else
    $('#pq-season').val('').prop('disabled', true);
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

  var qt = checkrange ? 'player-woodmoney-range' : 'player-woodmoney-season';
  var indent = checkrange ? 3 : 4;

  $.ajax({
    url: '/ajax/' + qt + '?' + $(this).serialize(),
    complete: function () {
      $('#pq-woodmoneydata').css('display', 'block');
    },
    beforeSend: function () {
      $('#pq-woodmoneydata').css('display', 'none');
    }
  }).done(function (data) {
    $('#pq-woodmoneydata').html(data);
    $('#pq-1w2 > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc'],
      scrollX: true,
      scrollCollapse: true
    });
    $('#pq-1wo2 > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc'],
      scrollX: true,
      scrollCollapse: true
    });
    $('#pq-2wo1 > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc'],
      scrollX: true,
      scrollCollapse: true
    });
    $('#pq-all > table').DataTable({
      orderClasses: false,
      'stripeClasses': ['stripe1', 'stripe2'],
      order: [indent, 'desc'],
      scrollX: true,
      scrollCollapse: true
    });
  });

  return false;
})