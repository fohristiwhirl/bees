"use strict";

function newimage(src) {
    var ret = new Image();
    ret.src = src;
    return ret;
}

function randint(n) {
    return Math.floor(Math.random() * n);
}

var MARGIN_OF_ERROR = 2;
var PLAYER_MAX_SPEED = 7.5;
var BEECOUNT = 35;

var sim = {};
