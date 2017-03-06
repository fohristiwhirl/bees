"use strict";

function make_stars() {

    var stars = [];

    var lookup = [];        // Convert a magnitude 0-255 into a colour #000000 - #ffffff

    var i;
    var mag_string;

    for (i = 0; i <= 255; i += 1) {

        mag_string = i.toString(16);
        if (mag_string.length === 1) {
            mag_string = "0" + mag_string;
        }

        lookup[i] = "#" + mag_string + mag_string + mag_string;
    }

    stars.draw = function () {
        var n;
        var mag;
        var x;
        var y;

        var len = this.length;

        var centre_x = canvas.width / 2;
        var centre_y = canvas.height / 2;

        for (n = 0; n < len; n += 1) {

            x = this[n].x;
            y = this[n].y;

            mag = Math.abs(x - centre_x) + Math.abs(y - centre_y);
            mag *= this[n].brightness;
            mag = Math.floor(mag);
            if (mag > 255) {
                mag = 255;
            }

            // We save a little on computation by drawing each star twice.
            // But I think the fillRect is the real performance-killer.

            virtue.fillStyle = lookup[mag];
            virtue.fillRect(Math.floor(x), Math.floor(y), 1, 1);
            virtue.fillRect(Math.floor(canvas.width - x), Math.floor(canvas.height - y), 1, 1);
        }
    };

    stars.move = function () {

        if (this.length < 175) {
            this.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                speedx: Math.random() * 4 - 2,
                speedy: Math.random() * 4 - 2,
                brightness: Math.random() * 0.5
            });
        }

        var n;
        var len = this.length;

        for (n = 0; n < len; n += 1) {

            this[n].x += this[n].speedx;
            this[n].y += this[n].speedy;

            if (this[n].x < 0 || this[n].x >= canvas.width || this[n].y < 0 || this[n].y >= canvas.height) {
                this[n].x = canvas.width / 2;
                this[n].y = canvas.height / 2;
                this[n].speedx = Math.random() * 4 - 2;
                this[n].speedy = Math.random() * 4 - 2;
                this[n].brightness = Math.random() * 0.5;
            }
        }
    };

    return stars;
}
