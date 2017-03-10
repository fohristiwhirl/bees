"use strict";

document.addEventListener("keydown", function (evt) {
    if (evt.key === "n") {
        sim.next_level();
        alert("Skipped to level " + sim.level);
    } else if (evt.key === "l") {
        sim.player.lives += 1;
    } else {
        sim.player.keyboard[evt.key] = true;
    }
});

document.addEventListener("keyup", function (evt) {
    sim.player.keyboard[evt.key] = false;
});

var canvas = document.getElementById("bees");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var virtue = canvas.getContext("2d");
