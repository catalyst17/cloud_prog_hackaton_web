/*global GS _config*/

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

var shoppingList = [
{
    pName: "Sanitizer",
    pId: "00012345",
    quantity: 3,
    userName: "Guo",
    location: "Delta Building",
    distance: "0.6km",
    description: ""
},
{
    pName: "Toilet Paper",
    pId: "00012321",
    quantity: 5,
    userName: "Jason",
    location: "Qing Dorm",
    distance: "0.1km",
    description: "Leave at the lobby, thank you!"
}];
var wishList = [
    {
        pName: "Apples",
        pId: "00012325",
        quantity: 1,
        userName: "Lin",
        location: "Delta Building",
        distance: "0.6km",
        status: "In Progress",
        description: ""
    },
    {
        pName: "Oranges",
        pId: "00012321",
        quantity: 6,
        userName: "Lui",
        location: "Qing Dorm",
        distance: "0.1km",
        status: "In Need",
        description: "Bigger one"
    }
];

$(document).ready(function() {
    getCurrentVolunteerShoppingListData();
    getAllWishListData();

    $("#addProductBtn").click(function(){
        updateCurrentList("AAA",3,"asdf");
    });
    $('#deleteProductBtn').click(function(){
        deleteProductFromShoppingList();
    })
    $('#completeProductBtn').click(function(){
        completeProductFromShoppingList();
    })
    $('#takeProductBtn').click(function(){
        takeProductToShoppingList();
    })
});

function getCurrentVolunteerShoppingListData(){
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'POST',
        url: _config.api.invokeUrl + '/getCurrentVolunteerShoppingList',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        success: function(response) {
            console.log(response);
            shoppingList = response;
            displayCurrentShoppingList(shoppingList);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting display shopping list: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}

function getAllWishListData(){
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'POST',
        url: _config.api.invokeUrl + '/getAllWishList',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        success: function(response) {
            console.log(response);
            wishList = response;
            displayAllWishList(wishList);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting display wishlist: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}

function displayCurrentShoppingList(productData){
    var output = [];
    for(var i=0; i<productData.length; i++){
        var item = "";
        for(var i=0; i<productData.length; i++){
            item = '<tr>' +
                '<td><div class="form-group form-check"><input type="checkbox" class="form-check-input checkProduct"></div></td>' +
                '<td>'+productData[i].pName + '</td>' +
                '<td>'+productData[i].quantity + '</td>' +
                '<td>'+productData[i].userName + '</td>' +
                '<td>'+productData[i].location + '</td>' +
                '<td>'+productData[i].distance + '</td>' +
                '<td>'+ productData[i].description +'</td>' +
                '<td scope="col" style="display: none">'+ productData[i].pId +'</td>'
            '</tr>';
            output.push(item);
        }
    }
    
    // finally combine our output list into one string of html and put it on the page
    $('#myCurrentShoppingListTable').empty();
    $('#myCurrentShoppingListTable').append(output);
}

function displayAllWishList(productData){
    var output = [];
    for(var i=0; i<productData.length; i++){
        var item = "";
        // for each available option to this question...
        for(var i=0; i<productData.length; i++){
            item = '<tr>' +
                '<td><div class="form-group form-check"><input type="checkbox" class="form-check-input checkProduct" id="exampleCheck1"></div></td>' +
                '<td>'+productData[i].pName + '</td>' +
                '<td>'+productData[i].quantity + '</td>' +
                '<td>'+productData[i].userName + '</td>' +
                '<td>'+productData[i].location + '</td>' +
                '<td>'+productData[i].distance + '</td>';

            if(productData[i].status == "In Progress")
                item += '<td><span class="badge badge-pill badge-warning">' + productData[i].status + '</span></td>';
            else if(productData[i].status == "In Need")
                item += '<td><span class="badge badge-pill badge-info">' + productData[i].status + '</span></td>';
            else if(productData[i].status == "Arrived")
                item += '<td><span class="badge badge-pill badge-success">' + productData[i].status + '</span></td>';
            else
                continue;
            item += 
                '<td>'+ productData[i].description +'</td>' +
                '<td scope="col" style="display: none">'+ productData[i].pId +'</td>'
            '</tr>';
            output.push(item);
        }
    }
    // finally combine our output list into one string of html and put it on the page
    $('#wishListTable').empty();
    $('#wishListTable').append(output);
}

function deleteProductFromShoppingList(){
    var data = checkProduct('#myCurrentShoppingListTable');
    console.log(data);
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'POST',
        url: _config.api.invokeUrl + '/deleteProductFromShoppingList',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: JSON.stringify(data),
        success: function(response) {
            console.log(response);
            displayCurrentList(response);
      }
    });
}

function completeProductFromShoppingList(){
    var data = checkProduct('#myCurrentShoppingListTable');
    console.log(data);
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'POST',
        url: _config.api.invokeUrl + '/complete-products',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: JSON.stringify(data),
        success: function(response) {
            console.log(response);
            getCurrentVolunteerShoppingListData();
      }
    });
}

function takeProductToShoppingList(){
    var data = checkProduct('#wishListTable');
    console.log(data);
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'POST',
        url: _config.api.invokeUrl + '/takeProductToShoppingList',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: JSON.stringify(data),
        success: function(response) {
            console.log(response);
            displayCurrentList(response);
      }
    });
}