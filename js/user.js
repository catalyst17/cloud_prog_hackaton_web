/*global GS _config*/

var GS = window.GS || {};
GS.map = GS.map || {};

var authToken;
GS.authToken.then(function setAuthToken(token) {
    if (token) {
        authToken = token;
    } else {
        // window.location.href = '/signin.html';
    }
}).catch(function handleTokenError(error) {
    alert(error);
    // window.location.href = '/signin.html';
});

$(document).ready(function() {
    // getCurrentUserListData();
    $("#addProductBtn").click(function(){
        updateCurrentList("AAA",3,"asdf");
    });
});

function addProduct(pName, quantity, description) {
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/addProduct',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: JSON.stringify({
            pName: pName,
            quantity: quantity,
            description: description
        }),
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            updateCurrentList(pName, quantity, description);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting add product: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured when requesting add product:\n' + jqXHR.responseText);
        }
    });
}

function deleteProduct(pName) {
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/deleteProduct',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: JSON.stringify({
            pName: pName,
        }),
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            updateCurrentList(pName, quantity, description);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting delete product: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured when requesting delete product:\n' + jqXHR.responseText);
        }
    });
}

function getCurrentUserListData(){
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'POST',
        url: _config.api.invokeUrl + '/getCurrentUserList',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        success: function(response) {
            console.log(response);
            displayCurrentList(response);
      },
    });
}

function updateCurrentList(pName, quantity, description){
    var output = '<tr>' +
    '<td><div class="form-group form-check"><input type="checkbox" class="form-check-input checkProduct"></div></td>' +
    '<td>'+ pName + '</td>' +
    '<td>'+ quantity + '</td>' +
    '<td><span class="badge badge-pill badge-success">In Need</span></td>' +
    '<td>'+ description +'</td>' +
    '<td></td>' +
'</tr>';

    // finally combine our output list into one string of html and put it on the page
    $('#myCurrentListTable').append(output);
}

function displayCurrentList(productData){
    var output = [];

    for(var i=0; i<productData.length; i++){
        var item = "";
        // for each available option to this question...
        for(var j=0; j<productData[i].length; j++){
            item = '<tr>' +
            '<td><div class="form-group form-check"><input type="checkbox" class="form-check-input checkProduct"></div></td>' +
                '<td>'+ productData[i].pName + '</td>' +
                '<td>'+productData[i].quantity + '</td>' +
                '<td><span class="badge badge-pill">' + productData[i].status + '</span></td>' +
                '<td>'+ productData[i].description +'</td>' +
                '<td></td>' +
                '<td scope="col" style="display: none">'+ productData[i].pId +'</td>'
            '</tr>';
        }
        output.push(item);
    }
    // finally combine our output list into one string of html and put it on the page
    $('#myCurrentListTable').append(output);
}