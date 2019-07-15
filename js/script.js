'use strict';
// default variable for the deck
var deck = {1:"./img/card1.jpg", 2:"./img/card2.jpg", 3:"./img/card3.jpg",4:"./img/card4.jpg",5:"./img/card5.jpg",6:"./img/card6.jpg",7:"./img/card7.jpg",8:"./img/card8.jpg",
            9:"./img/card9.jpg", 10:"./img/card10.jpg", 11:"./img/card11.jpg", 12:"./img/card12.jpg", 13:"./img/card13.jpg", 14:"./img/card14.jpg", 15:"./img/card15.jpg", 16:"img/card16.jpg",
            17:"img/card17.jpg", 18:"img/card18.jpg", 19:"img/card19.jpg", 20:"img/card20.jpg", 21:"img/card21.jpg", 22:"img/card22.jpg", 23:"img/card23.jpg", 24:"img/card24.jpg",
            25:"img/card25.jpg", 26:"img/card26.jpg", 27:"img/card27.jpg", 28:"img/card28.jpg", 29:"img/card29.jpg", 30:"img/card30.jpg", 31:"img/card31.jpg", 32:"img/card32.jpg"}

// select 8 cards and shuffle the deck
var shuffle1 = _.shuffle(deck).slice(0, 8);
var shuffle2 = _.shuffle(shuffle1);
var shuffledDeck = shuffle1.concat(shuffle2);
    shuffledDeck = _.shuffle(shuffledDeck);

// create grid and fill the grid with the cards
function createGrid(params) {
    var rowCount = 1;
    for(var i = 0; i < shuffledDeck.length; i++){
        if(i % 4 == 0|| rowCount == 1){
            $('table').append('<tr class="row" role="row"></tr>');
            rowCount++;
            $("tr:empty").append("<td class='col-md-3 no-padding' role='gridcell'></td>");
            $("td:empty").append("<button class='sq" + i + " face-down' aria-label='card backside'><span aria-live='polite'><a class='sr-only sr-only-focusable'>Card " + (i + 1) + "</a></span></button>");
        } else {
            $("tr:last").append("<td class='col-md-3 no-padding' role='gridcell'></td>");
            $('tr:last > td:last').append("<button class='sq" + i + " face-down' aria-label='card backside'><span aria-live='polite'><a class='sr-only sr-only-focusable'>Card " + (i + 1) + "</a></span></button>");
        };
        $('span').hide();
        var k = $(".sq" + i).data("url", shuffledDeck[i]);
    };
    var width = $('body').innerWidth() / 4;
    $('button:not(.start, .close, .again)').css('width', width - 8 + "px");
    var height = ($(window).height() - $('div.info').height()) / 4;
    $('button:not(.start, .close, .again)').css('height', height - 8 + "px");
}

// initialize state variable for the deck
var state = {};
for(var i=0; i<shuffle1.length; i++){
    var now = shuffle1[i];
    state[now] = false;
};

var card1 = null;
var prevClass = '';
var className = '';
var now;
var matchesMade = 0;
var matchesRemaining = Object.keys(state).length;
var matchesMissed = 0;

// read metadata of selected card
$(document).on('click', 'button', function(){
    className = "." + $(this).attr("class").split(' ')[0];
    var url  = $(className).data("url");
    flipCard(className, url);
});

// determine if selected card are pairs
function flipCard(className, url){
    $(className).removeClass('face-down').css('background-image', "url('./" + url + "')");
    $('button' + className + '> span').show();
    if(state[url] == true){
        card1 = null;
        console.log(card1);
    } else if(state[url] == false){
        if(card1 == null){
            card1 = url;
            prevClass = className;
        } else{
            $('button').prop('disabled', true);
            if(card1.includes(url)){
                matchesMade++;
                $('#made').text(matchesMade);
                matchesRemaining--;
                $('#remaining').text(matchesRemaining);
                state[url] = true;
                $('button').prop('disabled', false);
                if(matchesRemaining == 0){
                    $('#myModal').modal();
                };
            } else{
                matchesMissed++;
                $('#missed').text(matchesMissed);
                setTimeout(reset, 1000);
            };
            card1 = null;
        };
    };
};

// reset the image to back side of the card
function reset(){
    $(className).css('background-image', "url('./img/card-back.png')");
    $(prevClass).css('background-image', "url('./img/card-back.png')");
    $('button').prop('disabled', false);
};

// initialize all values when start button is clicked
$('.start').click(function(){
    matchesMade = 0;
    matchesRemaining = 8;
    matchesMissed = 0;
    $('tr').remove();
    now = moment();
    createGrid();
    var interval = window.setInterval(function(){
        var diffSec = moment().diff(now, 'seconds');
        $('#timer').text((parseInt(diffSec / 60)) + ' minutes ' + (diffSec % 60) + ' seconds');
    },1);
    $('#made').text(matchesMade);
    $('#remaining').text(matchesRemaining);
    $('#missed').text(matchesMissed);
    $('.initial').hide();
    $('.intro').hide();
    console.log(matchesMissed);
});