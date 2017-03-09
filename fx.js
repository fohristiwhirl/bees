"use strict";

function make_boss_hp_drawer() {
    var last_draw_i = 0;
    var draws_this_i = 0;

    return function (fraction) {
        var x1;
        var y1;
        var w;
        var h;

        if (last_draw_i !== sim.iteration_total) {
            draws_this_i = 1;
            last_draw_i = sim.iteration_total;
        }

        // Outline...

        x1 = canvas.width / 4;
        y1 = 20 * draws_this_i - 10;
        w = canvas.width / 2;
        h = 10;

        virtue.lineWidth = 3;

        virtue.strokeStyle = "#ff0000";
        virtue.beginPath();
        virtue.rect(x1, y1, w, h);
        virtue.stroke();

        // Filled rect...

        virtue.fillStyle = "#ff0000";
        virtue.fillRect(x1, y1, w * fraction, h);

        draws_this_i += 1;
    };
}
var draw_boss_hitpoints = make_boss_hp_drawer();


function draw_lightning(x1, y1, x2, y2, colour) {
    var n;
    var vector;
    var dx;
    var dy;
    var vecx;
    var vecy;
    var nextx;
    var nexty;
    var distance;

    var x = x1;
    var y = y1;

    virtue.lineWidth = 3;
    virtue.strokeStyle = colour;

    for (n = 0; n < 10; n += 1) {
        vector = unit_vector(x, y, x2, y2);
        vecx = vector[0];
        vecy = vector[1];

        dx = x2 - x;
        dy = y2 - y;
        distance = Math.sqrt(dx * dx + dy * dy);

        if (n === 9) {
            nextx = x2;
            nexty = y2;
        } else {
            nextx = x + (vecx * distance / (10 - n)) + (Math.random() * 14) - 7;
            nexty = y + (vecy * distance / (10 - n)) + (Math.random() * 14) - 7;
        }

        virtue.beginPath();
        virtue.moveTo(x, y);
        virtue.lineTo(nextx, nexty);
        virtue.stroke();

        x = nextx;
        y = nexty;
    }
}


function draw_line(x1, y1, x2, y2, colour) {
    virtue.lineWidth = 3;
    virtue.strokeStyle = colour;
    virtue.beginPath();
    virtue.moveTo(x1, y1);
    virtue.lineTo(x2, y2);
    virtue.stroke();
}


function draw_circle(x, y, radius, colour) {
    virtue.lineWidth = 5;
    virtue.strokeStyle = colour;
    virtue.beginPath();
    virtue.arc(x, y, radius, 0, TWO_PI);
    virtue.stroke();
}
