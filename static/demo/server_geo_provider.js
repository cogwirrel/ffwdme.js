
// interface Geolocation { 
//   void getCurrentPosition(PositionCallback successCallback,
//                           optional PositionErrorCallback errorCallback,
//                           optional PositionOptions options);

// dictionary PositionOptions {
//   boolean enableHighAccuracy = false;
//   [Clamp] unsigned long timeout = 0xFFFFFFFF;
//   [Clamp] unsigned long maximumAge = 0;
// };


//   long watchPosition(PositionCallback successCallback,
//                      optional PositionErrorCallback errorCallback,
//                      optional PositionOptions options);

//   void clearWatch(long watchId);
// };

// callback PositionCallback = void (Position position);

// callback PositionErrorCallback = void (PositionError positionError);

// interface Position {
//   readonly attribute Coordinates coords;
//   readonly attribute DOMTimeStamp timestamp;
// };

// interface Coordinates {
//   readonly attribute double latitude;
//   readonly attribute double longitude;
//   readonly attribute double? altitude;
//   readonly attribute double accuracy; // meters
//   readonly attribute double? altitudeAccuracy; // meters
//   readonly attribute double? heading;
//   readonly attribute double? speed;
// };


// Implements API: https://dev.w3.org/geo/api/spec-source.html#navi-geo
var ServerGeoProvider = function(host, port) {
    this.url = 'http://' + host + ':' + port;

    this.geo_data = {
        coords: {
            latitude: 0,
            longitude: 0,
            altitude: 0,
            accuracy: 1,
            altitudeAccuracy: null,
            heading: 0,
            speed: 0
        },
        timestamp: Date.now()
    };

    var that = this;
    window.socket.on('gps-update', function(geo_data) {
        console.log("Received gps update");
        console.log(geo_data);
        that.geo_data = {
            coords: {
                latitude: geo_data.latitude,
                longitude: geo_data.longitude,
                altitude: geo_data.altitude,
                accuracy: 1, // No idea!
                altitudeAccuracy: null,
                heading: geo_data.track,
                speed: geo_data.speed,
            },
            timestamp: Date.now()
        };
    });

    this.pollInterval = 350;

    return this;
};

  
ServerGeoProvider.prototype.getCurrentPosition = function(success, error, options) {
    // We ignore the options, just cause!
    success(this.geo_data);
};

ServerGeoProvider.prototype.watchPosition = function(success, error, options) {
    var that = this;
    var watchId = window.setInterval(function() {
        return that.getCurrentPosition(success, error, options);
    }, this.pollInterval);
    return watchId;
};

ServerGeoProvider.prototype.clearWatch = function(watchId) {
    window.clearInterval(watchId);
};