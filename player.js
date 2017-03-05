"use strict";

// ---------------------------------------------------------------------------------------------
// CRACKED SHIP

var base_cracked = Object.create(base_entity);
base_cracked.harmless = true;
base_cracked.death_sound = null;
base_cracked.age = 0;

base_cracked.damage = function () {
    this.age += 1;
    if (this.age > 60) {
        this.hp = 0;
    }
};

var base_cracked_left = Object.create(base_cracked);
base_cracked_left.sprites = [newimage("res/cracked_left.png")];

var base_cracked_right = Object.create(base_cracked);
base_cracked_right.sprites = [newimage("res/cracked_right.png")];


// ---------------------------------------------------------------------------------------------
// PLAYER CONSTRUCTOR

function make_player() {

    var player = {
        max_speed: PLAYER_MAX_SPEED,
        sprites: [newimage("res/ship1.png"), newimage("res/ship2.png")],
        framerate: 60,
        lives: 3,
        keyboard: {"w": false, "a": false, "s": false, "d": false, " ": false}
    };

    player.reset = function () {
        this.x = -120;
        this.y = canvas.height / 2;
        this.speedx = 4;
        this.speedy = 0;
        this.respawn_timer = 120;
        this.immune_timer = 120;
        this.alive = true;
    };

    player.move = function () {

        if (this.keyboard.w) {
            this.speedy -= 1;
        }
        if (this.keyboard.a) {
            this.speedx -= 1;
        }
        if (this.keyboard.s) {
            this.speedy += 1;
        }
        if (this.keyboard.d) {
            this.speedx += 1;
        }

        if (this.keyboard.a === false && this.keyboard.d === false) {
            this.speedx *= 0.85;
            if (this.speedx < 0.05 && this.speedx > -0.05) {
                this.speedx = 0;
            }
        }

        if (this.keyboard.w === false && this.keyboard.s === false) {
            this.speedy *= 0.85;
            if (this.speedy < 0.05 && this.speedy > -0.05) {
                this.speedy = 0;
            }
        }

        if (this.immune_timer > 0 && this.x < this.sprites[0].width / 2) {
            this.speedx = 4;
            this.speedy = 0;
        }

        if (this.speedx > this.max_speed) {
            this.speedx = this.max_speed;
        }

        if (this.speedx < -this.max_speed) {
            this.speedx = -this.max_speed;
        }

        if (this.speedy > this.max_speed) {
            this.speedy = this.max_speed;
        }

        if (this.speedy < -this.max_speed) {
            this.speedy = -this.max_speed;
        }

        if ((this.x < this.sprites[0].width && this.speedx < 0) || (this.x > canvas.width - this.sprites[0].width && this.speedx > 0)) {
            this.speedx = 0;
        }
        if ((this.y < this.sprites[0].height && this.speedy < 0) || (this.y > canvas.height - this.sprites[0].height && this.speedy > 0)) {
            this.speedy = 0;
        }

        this.x += this.speedx;
        this.y += this.speedy;
    };

    player.damage = function () {

        var dx;
        var dy;
        var n;
        var arr = sim.entities;
        var len = sim.entities.length;
        var item;

        if (this.immune_timer > 0) {
            this.immune_timer -= 1;
            return;
        }

        for (n = 0; n < len; n += 1) {
            item = arr[n];
            if (item.harmless === false) {
                dx = Math.abs(item.x - this.x);
                dy = Math.abs(item.y - this.y);

                if (dx < this.sprites[0].width / 2 && dy < this.sprites[0].height / 2) {
                    this.alive = false;
                    this.lives -= 1;
                    this.crack();
                    item.hp = 0;
                    break;
                }
            }
        }
    };

    player.crack = function () {
        var left = Object.create(base_cracked_left);
        left.x = this.x;
        left.y = this.y;
        left.speedx = this.speedx - 2;
        left.speedy = this.speedy;
        sim.entities.push(left);

        var right = Object.create(base_cracked_right);
        right.x = this.x;
        right.y = this.y;
        right.speedx = this.speedx + 2;
        right.speedy = this.speedy;
        sim.entities.push(right);
    };

    return player;
}
