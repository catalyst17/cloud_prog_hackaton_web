"use strict";!function(){var n=$("html"),t=function(){$(".btn-menu").on("click",function(t){t.preventDefault(),n.toggleClass("menu-opened")})},e=function(){t()};e()}();

// send notification when the goods arrive

// display users page
$(document).ready(function () {
    $('#participants').multiInput({
        json: true,
        input: $('<div class="row inputElement">\n' +
            '<div class="multiinput-title col-xs-12">Teilnehmer <span class="number">1</span></div>\n' +
            '<div class="form-group col-xs-6">\n' +
            '<input class="form-control" name="tn_firstname" placeholder="Vorname" type="text">\n' +
            '</div>\n' +
            '<div class="form-group col-xs-6">\n' +
            '<input class="form-control" name="tn_lastname" placeholder="Nachname" type="text">\n' +
            '</div>\n' +
            '</div>\n'),
        limit: 10,
        onElementAdd: function (el, plugin) {
            console.log(plugin.elementCount);
        },
        onElementRemove: function (el, plugin) {
            console.log(plugin.elementCount);
        }
    });
});
// display volunteers page

// get user's location
function getUserLocation(){

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