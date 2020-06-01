/*global GS _config*/

// var GS = window.GS || {};
// GS.map = GS.map || {};

// var authToken;
// GS.authToken.then(function setAuthToken(token) {
//     if (token) {
//         authToken = token;
//     } else {
//         window.location.href = '/signin.html';
//     }
// }).catch(function handleTokenError(error) {
//     alert(error);
//     window.location.href = '/signin.html';
// });

var wishList = [];

$(document).ready(function() {
    getCurrentWishListData();

    $("#addProductBtn").click(function(){
        addProduct();
    });
    $('#removeProductBtn').click(function(){
        deleteProduct();
    })
    $('#confirmProductBtn').click(function(){
        confirmProduct();
    })
});

function addProduct() {
    getCurrentWishListData();
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

function deleteProduct() {
    var data = checkProduct('#myCurrentListTable');
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/delete-products',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            getCurrentWishListData();
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
        url: _config.api.invokeUrl + '/confirm-products',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
            console.log(response);
            getCurrentWishListData();
            promptRating(response);
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
            console.log(response);
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

    for(var i=0; i<productData.length; i++){
        item = '<tr>' +
            '<td><div class="form-group form-check"><input type="checkbox" class="form-check-input checkProduct"></div></td>' +
            '<td>'+ productData[i].ProductName + '</td>' +
            '<td>'+productData[i].Quantity + '</td>';
        if(productData[i].Status === "In progress")
            item += '<td><span class="badge badge-pill badge-warning">' + productData[i].Status + '</span></td>';
        else if(productData[i].Status === "In need")
            item += '<td><span class="badge badge-pill badge-info">' + productData[i].Status + '</span></td>';
        else if(productData[i].Status === "Ready")
            item += '<td><span class="badge badge-pill badge-success">' + productData[i].Status + '</span></td>';
        else if(productData[i].Status === "Confirmed")
            item += '<td><span class="badge badge-pill badge-light">' + productData[i].Status + '</span></td>';
        else
            continue;
        item += 
            '<td>'+ productData[i].Description +'</td>' +
            '<td>'+ productData[i].Volunteer + '</td>' +
            '<td scope="col" style="display: none">'+ productData[i].ID.toString() +'</td>'
        '</tr>';
        output.push(item);
    }
    // finally combine our output list into one string of html and put it on the page

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

function submitFeedback(volunteer){

    var data = {
        feedback: $('#feedbackText').val(),
        rating: ratingScore,
        volunteer: volunteer,
        username: userInfo.name
    }
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/send-feedback',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        data: JSON.stringify(data),
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
function setRatingScore(score){
    ratingScore = score;
}

function promptRating(volunteerList){
    var toast = $('.toast').find('.volunteer');
    for(var i=0; i<volunteerList.length; i++){
        toast.eq(i).html(volunteerList[i]);
    }
    $('.toast').toast('show');
}