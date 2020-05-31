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

var wishList = [
    {
        ProductName: "Apples",
        ID: "00012325",
        Quantity: 1,
        Status: "In Progress",
        Description: "",
        Volunteer: "Kevin"
    },
    {
        ProductName: "Oranges",
        ID: "00012321",
        Quantity: 6,
        Status: "In Need",
        Description: "Bigger one",
        Volunteer: "Kevin"
    },
    {
        ProductName: "Bananas",
        ID: "00012321",
        Quantity: 6,
        Status: "Arrived",
        Description: "Bigger one",
        Volunteer: "Kevin"
    }
];

$(document).ready(function() {
    // getCurrentUserListData();
    displayCurrentList(wishList);
    $("#addProductBtn").click(function(){
        addProduct();
    });
    $('#removeProductBtn').click(function(){
        deleteProduct();
    })
});

function addProduct() {
    var data = [];
    var productList = $(".product-row");

    for(var i = 0; i < productList.length; i ++){
        var product = {
            pName: productList.eq(i).find("input[name=pName]").val(),
            quantity: productList.eq(i).find("input[name=quantity]").val(),
            description: productList.eq(i).find("input[name=description]").val(),
            pId: generateRandomId()
        };
        if(product.pName == "" || product.quantity == ""){
            alert("Product name and quantity cannot be blank");
            return;
        }
        data.push(product);
    }
    
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/add-products',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            getCurrentWishListData();
            cleanUpListRow();
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting add product: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}

// function requestUnicorn() {
//     $.ajax({
//         method: 'POST',
//         url: _config.api.invokeUrl + '/ride',
//         headers: {
//             "content-type": "application/json; charset=UTF-8"
//         },
//         data: JSON.stringify({
//             PickupLocation: {
//                 Latitude: 20.1234,
//                 Longitude: 120.1234
//             }
//         }),
//         contentType: 'application/json',
//         success: function(){ console.log("success")},
//         error: function ajaxError(jqXHR, textStatus, errorThrown) {
//             console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
//             console.error('Response: ', jqXHR.responseText);
//             alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
//         }
//     });
// }



function deleteProduct() {
    var data = checkProduct('#myCurrentListTable');
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/deleteProduct',
        headers: {
            Authorization: authToken
        },
        data: data,
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            updateCurrentList(pName, quantity, description);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting delete product: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}

function confirmProduct() {
    var data = checkProduct('#myCurrentListTable');
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/confirmProduct',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: data,
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            updateCurrentList(pName, quantity, description);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting delete product: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}

function getCurrentWishListData(){
    $.ajax({
        async: true,
        method: 'GET',
        url: _config.api.invokeUrl + '/wish-list',
        headers: {
            Authorization: authToken
        },
        success: function(response) {
            wishList = response;
            displayCurrentList(wishList);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting add product: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}

function displayCurrentList(productData){
    var output = [];
    var item = '';
    console.log(productData);

    for(var i=0; i<productData.length; i++){
        item = '<tr>' +
            '<td><div class="form-group form-check"><input type="checkbox" class="form-check-input checkProduct"></div></td>' +
            '<td>'+ productData[i].ProductName + '</td>' +
            '<td>'+productData[i].Quantity + '</td>';
        console.log(item);
        if(productData[i].Status === "In Progress") {
            console.log("AAAAAAAAAAAAAAAAAAAAAAAAa");
            item += '<td><span class="badge badge-pill badge-warning">' + productData[i].Status + '</span></td>';
        }
        else if(productData[i].Status === "In Need")
            item += '<td><span class="badge badge-pill badge-info">' + productData[i].Status + '</span></td>';
        else if(productData[i].Status === "Arrived")
            item += '<td><span class="badge badge-pill badge-success">' + productData[i].Status + '</span></td>';
        else
            continue;
        console.log(item);
        item += 
            '<td>'+ productData[i].Description +'</td>' +
            '<td>'+ productData[i].Volunteer + '</td>' +
            '<td scope="col" style="display: none">'+ productData[i].ID.toString() +'</td>'
        '</tr>';
        console.log(item);
        output.push(item);
    }
    // finally combine our output list into one string of html and put it on the page
    console.log(output);
    $('#myCurrentListTable').empty();
    $('#myCurrentListTable').append(output);
}

function addListRow(){
    var row = '<div class="form-row product-row">' +
    '<div class="col-md-4"><input type="text" class="form-control" placeholder="ex. Apple" name="pName"></div>' +
    '<div class="col-md-1"><input type="text" class="form-control" placeholder="0" name="quantity"></div>  ' +
    '<div class="col-md-6"><input type="text" class="form-control" placeholder=""  name="description"></div>' +
    '<div class="col-md-1">' +
        '<button type="button" class="btn inline-button" onclick="addListRow()"><i class="fa fa-plus-circle" aria-hidden="true"></i></button>' +
        '<button type="button" class="btn inline-button"  onclick="deleteListRow(this)"><i class="fa fa-minus-circle" aria-hidden="true"></i></button>' +
    '</div></div>';
    $('.row-wrapper').append(row);
}

function deleteListRow(btn){
    if($('.product-row').length == 1) return;
    console.log(btn.closest('.product-row'));
    btn.closest('.product-row').remove();
}

function cleanUpListRow(btn){
    while($('.product-row').length > 1){
        $('.product-row').last().remove();
    }
    $('.product-row').find("input").val("");
}

function submitFeedback(){
    var data = {
        feedback: $('#feedbackText').val(),
        rating: ratingScore
    }
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/sendFeedback',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: data,
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            $('.toast').toast('hide');
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $('.toast').toast('hide');
            console.error('Error requesting add product: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}

var ratingScore = 0;
function setRatingScore(setRatingScore){
    ratingScore = score;
}