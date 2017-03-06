"use strict";

document.addEventListener("keydown", function (evt) {
    sim.player.keyboard[evt.key] = true;
});

document.addEventListener("keyup", function (evt) {
    sim.player.keyboard[evt.key] = false;
});

var canvas = document.getElementById("bees");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var virtue = canvas.getContext("2d");
