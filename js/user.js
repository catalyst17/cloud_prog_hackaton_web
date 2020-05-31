/*global GS _config*/

var GS = window.GS || {};
GS.map = GS.map || {};

var authToken;
GS.authToken.then(function setAuthToken(token) {
    if (token) {
        authToken = token;
        console.log(authToken);
    } else {
        window.location.href = '/signin.html';
    }
}).catch(function handleTokenError(error) {
    alert(error);
    window.location.href = '/signin.html';
});

var wishList = [
    {
        pName: "Apples",
        pId: "00012325",
        quantity: 1,
        status: "In Progress",
        description: "",
        volunteer: "Kevin"
    },
    {
        pName: "Oranges",
        pId: "00012321",
        quantity: 6,
        status: "In Need",
        description: "Bigger one",
        volunteer: "Kevin"
    },
    {
        pName: "Bananas",
        pId: "00012321",
        quantity: 6,
        status: "Arrived",
        description: "Bigger one",
        volunteer: "Kevin"
    }
];

$(document).ready(function() {
    getCurrentWishListData();
    displayCurrentList(wishList);
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
    console.log(_config.api.invokeUrl);
    $.ajax({
        type: 'POST',
        url: 'https://kcjihhoe69.execute-api.us-east-1.amazonaws.com/latest/test',
        crossDomain: true,
        headers: {
            Authorization: authToken,
            'Access-Control-Allow-Origin': '*',
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
        url: _config.api.invokeUrl + '/deleteProduct',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify(data),
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
        crossDomain: true,
        method: 'POST',
        url: _config.api.invokeUrl + '/getCurrentWishList',
        headers: {
            Authorization: authToken
        },
        'Access-Control-Allow-Origin': '*',
        success: function(response) {
            console.log(response);
            wishList = response;
            displayCurrentList(wishList);
      },
    });
}

function displayCurrentList(productData){
    var output = [];

    for(var i=0; i<productData.length; i++){
        item = '<tr>' +
        '<td><div class="form-group form-check"><input type="checkbox" class="form-check-input checkProduct"></div></td>' +
            '<td>'+ productData[i].pName + '</td>' +
            '<td>'+productData[i].quantity + '</td>';
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
            '<td>'+ productData[i].volunteer + '</td>' +
            '<td scope="col" style="display: none">'+ productData[i].pId +'</td>'
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