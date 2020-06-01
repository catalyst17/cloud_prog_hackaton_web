"use strict";!function(){var n=$("html"),t=function(){$(".btn-menu").on("click",function(t){t.preventDefault(),n.toggleClass("menu-opened")})},e=function(){t()};e()}();

var GS = window.GS || {};
GS.map = GS.map || {};

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
userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

if (typeof AWSCognito !== 'undefined') {
    AWSCognito.config.region = _config.cognito.region;
}

if (!(_config.cognito.userPoolId &&
    _config.cognito.userPoolClientId &&
    _config.cognito.region)) {
  $('#noCognitoMessage').show();
}

// display users page
$(document).ready(function () {
  getUserInfoFromCognito();
});

var userInfo = {};

function getUserInfoFromCognito(){
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        console.log('session validity: ' + session.isValid());
 
        // NOTE: getSession must be called to authenticate user before calling getUserAttributes
        cognitoUser.getUserAttributes(function(err, attributes) {
            if (err) {
                console.log(err);
            } else {
                userInfo = {
                  "name": attributes[4].Value,
                  "email": attributes[6].Value,
                  "custom:longtitude": attributes[2].Value,
                  "custom:latitude": attributes[3].Value,
                  "custom:line_id": attributes[5].Value
                }
                console.log(userInfo);
                displayUserInfo();
            }
        });
    });
  }
}

function displayUserInfo(){
  $('#username').html(userInfo.name);
}

function getUserInfoFromTable(email){
  $.ajax({
    async: true,
    crossDomain: true,
    method: 'POST',
    url: _config.api.invokeUrl + '/user-info-query',
    headers: {
        Authorization: authToken
    },
    'Access-Control-Allow-Origin': '*',
    data: JSON.stringify(email),
    success: function(response) {
        console.log(response);
    }
  });
}

// select all checked products
function checkProduct(container){
    var checkList = $(container + ' .checkProduct:checkbox:checked');
    var checkProduct = [];
    for(var i = 0; i< checkList.length; i++){
        var product = {};
        var tr = $('.checkProduct:checkbox:checked')[i].closest("tr");
        product = {
            pName: tr.children[1].innerHTML,
            pId: tr.lastChild.innerHTML
        };
        checkProduct.push(product);
    }
    console.log(checkProduct);
    return checkProduct;
}

$('#stars li').on('mouseover', function(){
    var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on
   
    // Now highlight all the stars that's not after the current hovered star
    $(this).parent().children('li.star').each(function(e){
      if (e < onStar) {
        $(this).addClass('hover');
      }
      else {
        $(this).removeClass('hover');
      }
    });
    
  }).on('mouseout', function(){
    $(this).parent().children('li.star').each(function(e){
      $(this).removeClass('hover');
    });
  });
  
  
  /* 2. Action to perform on click */
  $('#stars li').on('click', function(){
    var onStar = parseInt($(this).data('value'), 10); // The star currently selected
    var stars = $(this).parent().children('li.star');
    
    for (var i = 0; i < stars.length; i++) {
      $(stars[i]).removeClass('selected');
    }
    
    for (var i = 0; i < onStar; i++) {
      $(stars[i]).addClass('selected');
    }
    
    // get rating score
    var ratingValue = parseInt($('#stars li.selected').last().data('value'), 10);
    console.log(ratingValue);
    setRatingScore(ratingValue);
  });

  function generateRandomId() {
    const typedArray = new Uint8Array(4);
    const randomValues = window.crypto.getRandomValues(typedArray);
    return randomValues.join('');
  }