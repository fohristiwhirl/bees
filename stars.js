"use strict";

function make_stars() {

    var stars = [];

    stars.draw = function () {
        var n;
        var mag;
        var mag_string;
        var len = this.length;

        for (n = 0; n < len; n += 1) {
            mag = Math.abs(this[n].x - (canvas.width / 2)) + Math.abs(this[n].y - (canvas.height / 2));
            mag *= this[n].brightness;
            mag = Math.floor(mag);
            mag = Math.min(255, mag);

            mag_string = mag.toString(16);
            if (mag_string.length === 1) {
                mag_string = "0" + mag_string;
            }
            virtue.fillStyle = "#" + mag_string + mag_string + mag_string;
            virtue.fillRect(Math.floor(this[n].x), Math.floor(this[n].y), 1, 1);
        }
    };

    stars.move = function () {

        if (this.length < 350) {
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
