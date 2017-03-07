"use strict";

function draw_boss_hitpoints(fraction) {
    var x1;
    var y1;
    var w;
    var h;

    // Outline...

    x1 = canvas.width / 4;
    y1 = 10;
    w = canvas.width / 2;
    h = 15;

    virtue.lineWidth = 3;

    virtue.strokeStyle = "#ff0000";
    virtue.beginPath();
    virtue.rect(x1, y1, w, h);
    virtue.stroke();

    // Filled rect...

    virtue.fillStyle = "#ff0000";
    virtue.fillRect(x1, y1, w * fraction, h);
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

function draw_lightning(x1, y1, x2, y2) {
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

    virtue.strokeStyle = "#009999";

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
    virtue.strokeStyle = colour;
    virtue.beginPath();
    virtue.moveTo(x1, y1);
    virtue.lineTo(x2, y2);
    virtue.stroke();
}
