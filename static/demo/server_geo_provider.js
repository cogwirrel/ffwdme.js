
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

    return this;
};

  
ServerGeoProvider.prototype.getCurrentPosition = function(success, error, options) {
    // We ignore the options, just cause!
    $.ajax({
        url: this.url + '/api/gps',
        success: function(geo_data) {
            success({
                coords: {
                    latitude: geo_data.latitude,
                    longitude: geo_data.longitude,
                    altitude: geo_data.altitude,
                    accuracy: 1, // No idea!
                    altitudeAccuracy: null,
                    heading: null,
                    speed: geo_data.speed,
                },
                timestamp: Date.now()
            })
        },
        error: function(e, message) {
            // interface PositionError {
            //     const unsigned short PERMISSION_DENIED = 1;
            //     const unsigned short POSITION_UNAVAILABLE = 2;
            //     const unsigned short TIMEOUT = 3;
            //     readonly attribute unsigned short code;
            //     readonly attribute DOMString message;
            //   };
            // The server doesn't know how to error!
            error({
                code: 1,
                message: message
            })
        }
    });
};

ServerGeoProvider.prototype.watchPosition = function(success, error, options) {
    var that = this;
    var watchId = window.setInterval(function() {
        return that.getCurrentPosition(success, error, options);
    })
    return watchId;
};

ServerGeoProvider.prototype.clearWatch = function(watchId) {
    window.clearInterval(watchId);
};