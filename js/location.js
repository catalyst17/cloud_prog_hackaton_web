/*global GS _config*/

var GS = window.GS || {};
GS.map = GS.map || {};

(function rideScopeWrapper($) {
    var authToken;
    GS.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    
    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }



    // var userData = {
    //     Username: ,
    //     Pool: userPool
    // }

    function updateLocation(newLocation) {
        var dataLatitude = {
            Name: 'custom:latitude',
            Value: newLocation.latitude.toString()
        };
        var dataLongtitude = {
            Name: 'custom:longtitude',
            Value: newLocation.longitude.toString()
        };
        var attributeLatitude = new AmazonCognitoIdentity.CognitoUserAttribute(dataLatitude);
        var attributeLongtitude = new AmazonCognitoIdentity.CognitoUserAttribute(dataLongtitude);

        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                cognitoUser.updateAttributes([attributeLatitude, attributeLongtitude], function(err, result) {
                    if (err) {
                        console.log(err.message || JSON.stringify(err));
                        return;
                    }
                    completeUpdate(result);
                });
            });
        }

        // $.ajax({
        //     method: 'POST',
        //     url: _config.api.invokeUrl + '/ride',
        //     headers: {
        //         Authorization: authToken
        //     },
        //     data: JSON.stringify({
        //         PickupLocation: {
        //             Latitude: newLocation.latitude,
        //             Longitude: newLocation.longitude
        //         }
        //     }),
        //     contentType: 'application/json',
        //     success: console.log("suc"),
        //     error: function ajaxError(jqXHR, textStatus, errorThrown) {
        //         console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
        //         console.error('Response: ', jqXHR.responseText);
        //         alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
        //     }
        // });
    }

    function completeUpdate(result) {
        console.log('Location updated');
        animateUpdate(function animateCallback() {
            displayUpdate('You have updated your location!');
            setTimeout(() => {  window.location.href = 'userPage.html'; }, 1000);
            GS.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Select location');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(GS.map).on('locationChange', handleLocationChanged);

        GS.authToken.then(function updateAuthMessage(token) {
            if (token) {
                console.log('User is authenticated.');
                //$('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handleLocationChanged() {
        var requestButton = $('#request');
        requestButton.text('Set location');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var newLocation = GS.map.selectedPoint;
        event.preventDefault();
        updateLocation(newLocation);
    }

    function animateUpdate(callback) {
        var dest = GS.map.selectedPoint;
        var origin = {};

        if (dest.latitude > GS.map.center.latitude) {
            origin.latitude = GS.map.extent.minLat;
        } else {
            origin.latitude = GS.map.extent.maxLat;
        }

        if (dest.longitude > GS.map.center.longitude) {
            origin.longitude = GS.map.extent.minLng;
        } else {
            origin.longitude = GS.map.extent.maxLng;
        }

        GS.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
