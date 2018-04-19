function init() {
  window.socket = io.connect('http://127.0.0.1:5555/');

  window.pinav = {};
  window.pinav.switch_to = function(view) {
    $('.pi-nav-container').hide();
    $('#container-' + view).show();
  };

  // Show dials by default
  window.pinav.switch_to('dials');

  var getColour = function( v ) {
    var theColor = "";
    if ( v < 50 ) {
          myGreen = 255;
          myRed = parseInt( ( ( v * 2 ) * 255 ) / 100 );
      }
    else  {
          myGreen = parseInt( ( ( 100 - v ) * 2 ) * 255 / 100 );
          myRed = 255;
      }
    theColor = "rgb(" + myRed + "," + myGreen + ",0)"; 
    return( theColor );
  };

  $("#dial-speed").knob();
  $("#dial-rev").knob();

  window.update_rev_colours = function(v) {
    var col = getColour(v / 80.0);
    $('#dial-rev').trigger('configure', {'fgColor': col});
  };

  window.socket.on('navigate-to', function(payload) {
    console.log('Navigate to request!');
    window.pinav.switch_to('nav');
    new ffwdme.routingService({
      dest: { lat: payload.latitude, lng: payload.longitude }
    }).fetch();
  });

  window.socket.on('custom-action', function(payload) {
    console.log('Custom action received!');
    console.log(payload);
    window.pinav.switch_to(payload.page);
  });

  /*
  'Engine Speed(rpm)',
  'Absolute Intake Pressure(Kg/cm^2)',
  'Pressure Sensor Voltage(mV)',
  'Throttle Voltage(mV)',
  'Primary Injector Pulse Width(mSec)',
  'Fuel Correction',
  'Leading Ignition Angle(deg)',
  'Trailing Ignition Angle(deg)',
  'Fuel Temperature(deg.C)',
  'Metalling Oil PumpDuty(%)',
  'Boost Duty(Tp, %)',
  'Boost Duty(Wg, %)',
  'Water Temperature(deg.C)',
  'Intake Air Temperature(deg.C)',
  'Knocking Level',
  'Battery Voltage(V)',
  'Vehicle Speed(Km/h)',
  'ISCV duty(%)',
  'O2 Sensor Voltage(mV)',
  'N/A',
  'Secondary Injector Pulse Width(mSec)',
  'N/A'
  */

  // for testing!
  setInterval(function() {
      var data = {
        'Secondary Injector Pulse Width(mSec)': "1.6015625",
        'Knocking Level': "1",
        'Boost Duty(Wg%)': "0.0",
        'Boost Duty(Tp%)': "40.0",
        'N/A': "141",
        'ISCV duty(%)': "1.5",
        'Leading Ignition Angle(deg)': "-10",
        'Battery Voltage(V)': "14.3",
        'Vehicle Speed(Km/h)': "0",
        'Primary Injector Pulse Width(mSec)': "2.09375",
        'Trailing Ignition Angle(deg)': "-12",
        'Metalling Oil PumpDuty(%)': "0.0",
        'Pressure Sensor Voltage(mV)': "1370",
        'Fuel Correction': "1.0",
        'Engine Speed(rpm)': "975",
        'Intake Air Temperature(deg.C)': "175",
        'Fuel Temperature(deg.C)': "-80",
        'Throttle Voltage(mV)': "0",
        'Absolute Intake Pressure(Kg/cm^2)': "0.1973",
        'O2 Sensor Voltage(mV)': "0.0",
        'Water Temperature(deg.C)': "81",
      };

      // Uncomment this line to test displaying ECU data!
      //window.onEcuUpdate(data);

  }, 3000);


  window.onEcuUpdate = function(payload) {
    try {
      var revs = parseFloat(payload['Engine Speed(rpm)']);
      var speed = parseFloat(payload['Vehicle Speed(Km/h)']);
      $('#dial-rev').val(revs).trigger('change');
      window.update_rev_colours(revs);
      $('#dial-speed').val(speed).trigger('change');
      var battery = Number(payload['Battery Voltage(V)']).toFixed(1);
      $('#water-temperature').text("Water: " + payload['Water Temperature(deg.C)'] + "°C");
      $('#battery-voltage').text("Battery: " + battery + "V");
    } catch (e) {
      console.log("Got an error setting ecu data - skipping!");
    }
    
  };

  window.socket.on('ecu-update', window.onEcuUpdate);


  ffwdme.on('geoposition:init', function() {
    console.info("Waiting for initial geoposition...");
  });

  ffwdme.on('geoposition:ready', function() {
    console.info("Received initial geoposition!");
    $('#loader').remove();
  });

  // setup ffwdme
  ffwdme.initialize({
    routing: 'GraphHopper',
    graphHopper: {
      apiKey: CREDENTIALS.graphHopper
    },
    // This replaces the browsers implementation of geolocation with calls to the python server in 'pi-nav'
    // See https://github.com/cogwirrel/pi-nav
    geoProvider: new ServerGeoProvider('localhost', 5555),
  });

  var tileURL = "https://api.tiles.mapbox.com/v4/" + CREDENTIALS.mapboxId + "/{z}/{x}/{y}.png?access_token=" + CREDENTIALS.mapboxToken;
  var map = new ffwdme.components.Leaflet({ el: $('#map'), tileURL: tileURL, center: { lat: 49.90179, lng: 8.85723 } });

  var audioData = {"file": ffwdme.defaults.audioBaseUrl + 'male/voice',
                    "meta_data": { "INIT": { "start": 0.01, "length": 8.01 }, "C": { "start": 8.01, "length": 8.01 }, "TL_now": { "start": 16.01, "length": 8.01 }, "TL_100": {"start": 24.01,"length": 8.01},"TL_500": {"start": 32.01,"length": 8.01},"TL_1000": {"start": 40.01,"length": 8.01},"TSLL_now": {"start": 48.01,"length": 8.01 },"TSLL_100": {"start": 56.01,"length": 8.01},"TSLL_500": {    "start": 64.01,    "length": 8.01  },  "TSLL_1000": {    "start": 72.01,    "length": 8.01  },  "TSHL_now": {    "start": 80.01,    "length": 8.01  },  "TSHL_100": {    "start": 88.01,    "length": 8.01  },  "TSHL_500": {    "start": 96.01,    "length": 8.01  },  "TSHL_1000": {    "start": 104.01,    "length": 8.01  },  "TR_now": {    "start": 112.01,    "length": 8.01  },  "TR_100": {    "start": 120.01,    "length": 8.01  },  "TR_500": {    "start": 128.01,    "length": 8.01  },  "TR_1000": {    "start": 136.01,    "length": 8.01  },  "TSLR_now": {    "start": 144.01,    "length": 8.01  },  "TSLR_100": {    "start": 152.01,    "length": 8.01  },  "TSLR_500": {    "start": 160.01,    "length": 8.01  },  "TSLR_1000": {    "start": 168.01,    "length": 8.01  },  "TSHR_now": {    "start": 176.01,    "length": 8.01  },  "TSHR_100": {    "start": 184.01,    "length": 8.01  },  "TSHR_500": {    "start": 192.01,    "length": 8.01  },  "TSHR_1000": {    "start": 200.01,    "length": 8.01  },  "TU": {    "start": 208.01,    "length": 8.01  },  "C_100": {    "start": 216.01,    "length": 8.01  },  "C_500": {    "start": 224.01,    "length": 8.01  },  "C_1000": {    "start": 232.01,    "length": 8.01  },  "C_LONG":{    "start": 240.01,    "length": 8.01  },  "FINISH":{    "start": 248.01,    "length": 8.01  },  "EXIT1":{    "start": 256.01,    "length": 8.01  },  "EXIT2":{    "start": 264.01,    "length": 8.01  },  "EXIT3":{    "start": 272.01,    "length": 8.01  },  "EXIT4":{    "start": 280.01,    "length": 8.01  },  "EXIT5":{    "start": 288.01,    "length": 8.01  }}};

  window.widgets = {
    map       : map,
    autozoom  : new ffwdme.components.AutoZoom({ map: map }),
    reroute   : new ffwdme.components.AutoReroute({ parent: '#playground' }),

    speed     : new ffwdme.components.Speed({ parent: '#playground', grid: { x: 1, y: 12 } }),
    destTime  : new ffwdme.components.TimeToDestination({ parent: '#playground', grid: { x: 4, y: 12 } }),
    destDist  : new ffwdme.components.DistanceToDestination({ parent: '#playground', grid: { x: 7, y: 12 } }),
    arrival   : new ffwdme.components.ArrivalTime({ parent: '#playground', grid: { x: 10, y: 12 } }),
    nextTurn  : new ffwdme.components.NextStreet({ parent: '#playground', grid: { x: 4, y: 11 } }),
    distance  : new ffwdme.components.DistanceToNextTurn({ parent: '#playground', grid: { x: 4, y: 10 } }),
    arrow     : new ffwdme.components.Arrow({ parent: '#playground', grid: { x: 0, y: 10 } }),
    audio     : new ffwdme.components.AudioInstructions({ parent: '#playground', grid: { x: 0, y: 6 }, bootstrapAudioData: audioData}),

    // experimental
    mapRotator: new ffwdme.components.MapRotator({ map: map }),
    // zoom      : new ffwdme.components.Zoom({ map: map, parent: '#playground', grid: { x: 3, y: 3 }}),
    // overview  : new ffwdme.components.RouteOverview({ map: map, parent: '#playground', grid: { x: 2, y: 2 }}),

    // debugging
    // geoloc  : new ffwdme.debug.components.Geolocation({ parent: '#playground', grid: { x: 5, y: 1 }}),
    navInfo : new ffwdme.debug.components.NavInfo(),
    routing : new ffwdme.debug.components.Routing()
  };


  ffwdme.on('routecalculation:success', function(response) {
    ffwdme.navigation.setRoute(response.route).start();
  });

}
