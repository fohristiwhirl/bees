"use strict";

var base_bee = {
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
    target: null,
    avoidance: 5000
};

base_bee.move = function () {

    this.oldx = this.lastx;
    this.oldy = this.lasty;
    this.lastx = this.x;
    this.lasty = this.y;

    // Switch target...

    if (this.target === null || this.target === undefined) {
        this.target = sim.player;
    }

    var dx;
    var dy;

    // Currently unused code...

    if (this.target !== sim.player) {
        dx = Math.abs(this.target.x - this.x);
        dy = Math.abs(this.target.y - this.y);
        if (dx < 100 && dy < 100) {
            if (this.target !== sim.player) {
                this.target = sim.player;
            }
        }
    }

    // Chase target...

    if (sim.player.alive || this.target !== sim.player) {

        var vector = this.unit_vector_to_target();
        var vecx = vector[0];
        var vecy = vector[1];

        if (vecx === 0 && vecy === 0) {
            this.speedx += Math.random() * this.accel_mod;
            this.speedy += Math.random() * this.accel_mod;
        } else {
            this.speedx += vecx * Math.random() * 2 * this.accel_mod / 2;
            this.speedy += vecy * Math.random() * 2 * this.accel_mod / 2;
        }

    } else {

        // We want to go to the player but the player is dead...

        this.speedx *= 2;
        this.speedy *= 2;
    }

    // Avoid scary entities...

    var enemy;
    var distance;
    var distance_squared;
    var adjusted_force;

    var n;
    var arr = sim.entities;
    var len = sim.entities.length;

    for (n = 0; n < len; n += 1) {
        enemy = arr[n];
        if (enemy.scary) {
            dx = (enemy.x - this.x) * 0.75;     // Reduce "distance" to strengthen effect.
            dy = (enemy.y - this.y) * 0.75;
            distance_squared = dx * dx + dy * dy;
            distance = Math.sqrt(distance_squared);
            if (distance > 0.01) {
                adjusted_force = this.avoidance / (distance_squared * distance);
                this.speedx -= dx * adjusted_force * Math.random();
                this.speedy -= dy * adjusted_force * Math.random();
            }
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
};

base_bee.unit_vector_to_target = function () {
    return unit_vector(this.x, this.y, this.target.x, this.target.y);
};

base_bee.draw = function () {
    draw_line(this.oldx, this.oldy, this.x, this.y, this.colour);
};

// ---------------------------------------------------------------------------------------------
// BEE ARRAY CONSTRUCTOR

function make_bees() {

    var bees = [];

    var bee;
    var r;
    var g;
    var b;

    while (bees.length < BEECOUNT) {
        bee = Object.create(base_bee);
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

    return bees;
}
