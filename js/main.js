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
    return checkProduct;
}