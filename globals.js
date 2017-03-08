"use strict";

function newimagearray() {      // Accepts variable number of arguments.
    var ret = [];
    var img;
    var i;
    for (i = 0; i < arguments.length; i += 1) {
        img = new Image();
        img.src = arguments[i];
        ret.push(img);
    }
    return ret;
}

function unit_vector(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    if (dx < 0.01 && dx > -0.01 && dy < 0.01 && dy > -0.01) {
        return [0, 0];
    }

    var distance = Math.sqrt(dx * dx + dy * dy);
    return [dx / distance, dy / distance];
}

var TWO_PI = 2 * Math.PI;

var BEECOUNT = 35;
var MARGIN_OF_ERROR = 2;        // For collision of bees with enemies
var PLAYER_MAX_SPEED = 8;
var PLAYER_LIVES = 4;

var sim = {};
