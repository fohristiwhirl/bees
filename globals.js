"use strict";

function make(base, params) {

    // More or less equivalent to Object.assign(Object.create(base), params);
    // But supporting IE9+

    var that = Object.create(base);
    var n;
    var keys;
    if (params) {                       // Might be undefined.
        keys = Object.keys(params);
        for (n = 0; n < keys.length; n += 1) {
            that[keys[n]] = params[keys[n]];
        }
    }
    return that;
}

function new_image_array() {            // Accepts variable number of arguments.
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

function get_distance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

var TWO_PI = 2 * Math.PI;

var BEECOUNT = 35;
var MARGIN_OF_ERROR = 2;        // For collisions, interpreted in the player's favour
var PLAYER_MAX_SPEED = 8;
var PLAYER_LIVES = 4;

var sim = {};
