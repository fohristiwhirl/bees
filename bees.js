"use strict";

var Bee = make(null, {

    x: 0,
    y: 0,
    lastx: 0,
    lasty: 0,
    oldx: 0,
    oldy: 0,
    speedx: 0,
    speedy: 0,
    accel_mod: 0.57,
    max_speed: 9,
    colour: "#ffffff",
    avoidance: 5000,

    move: function (scary_points) {

        this.oldx = this.lastx;
        this.oldy = this.lasty;
        this.lastx = this.x;
        this.lasty = this.y;

        // Chase target...

        var vector;
        var vecx;
        var vecy;

        if (sim.player.alive) {
            vector = this.unit_vector_to_player();
            vecx = vector[0];
            vecy = vector[1];
            if (vecx === 0 && vecy === 0) {
                this.speedx += Math.random() * this.accel_mod;
                this.speedy += Math.random() * this.accel_mod;
            } else {
                this.speedx += vecx * Math.random() * 2 * this.accel_mod / 2;
                this.speedy += vecy * Math.random() * 2 * this.accel_mod / 2;
            }
        } else {
            this.speedx *= 2;
            this.speedy *= 2;
        }

        // Avoid scary entities...

        var coord;
        var distance;
        var distance_squared;
        var adjusted_force;
        var dx;
        var dy;

        var n;
        var len = scary_points.length;

        for (n = 0; n < len; n += 1) {
            coord = scary_points[n];
            dx = (coord[0] - this.x);
            dy = (coord[1] - this.y);
            distance_squared = dx * dx + dy * dy;
            distance = Math.sqrt(distance_squared);
            if (distance > 0.01) {
                adjusted_force = this.avoidance / (distance_squared * distance);
                this.speedx -= dx * adjusted_force * Math.random();
                this.speedy -= dy * adjusted_force * Math.random();
            }
        }

        // Throttle speed...

        var speed = Math.sqrt(this.speedx * this.speedx + this.speedy * this.speedy);
        if (speed > this.max_speed) {
            this.speedx *= this.max_speed / speed;
            this.speedy *= this.max_speed / speed;
        }

        // Update position...

        this.x += this.speedx;
        this.y += this.speedy;
    },

    unit_vector_to_player: function () {
        return unit_vector(this.x, this.y, sim.player.x, sim.player.y);
    }
});

// ---------------------------------------------------------------------------------------------
// BEE ARRAY CONSTRUCTOR

function make_bees() {

    var bees = [];

    var bee;
    var r;
    var g;
    var b;

    while (bees.length < BEECOUNT) {
        bee = make(Bee);
        r = Math.floor(Math.random() * 127 + 128);
        g = Math.floor(Math.random() * 127 + 128);
        b = Math.floor(Math.random() * 127 + 128);
        bee.colour = "#" + r.toString(16) + g.toString(16) + b.toString(16);
        bees.push(bee);
    }

    bees.reset = function () {
        var n;
        var item;

        for (n = 0; n < this.length; n += 1) {

            item = this[n];

            if (item.x <= 0 || item.x >= canvas.width || item.y <= 0 || item.y >= canvas.height) {
                item.x = sim.player.x;
                item.y = sim.player.y;
                item.lastx = item.x;
                item.lasty = item.y;
                item.oldx = item.x;
                item.oldy = item.y;
                item.speedx = Math.random() * 10 - 5;
                item.speedy = Math.random() * 10 - 5;
            }
        }
    };

    bees.move = function () {
        var n;
        var len;
        var scary_points = [];

        len = sim.entities.length;
        for (n = 0; n < len; n += 1) {
            scary_points.push.apply(scary_points, sim.entities[n].list_scary_points());    // Array concat in place.
        }

        len = this.length;
        for (n = 0; n < len; n += 1) {
            this[n].move(scary_points);
        }
    };

    bees.draw = function () {
        var n;
        var len = this.length;

        for (n = 0; n < len; n += 1) {
            draw_line(this[n].oldx, this[n].oldy, this[n].x, this[n].y, this[n].colour);
        }
    };

    return bees;
}
