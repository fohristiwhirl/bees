"use strict";

// ---------------------------------------------------------------------------------------------
// PLAYER CONSTRUCTOR

function make_player() {

    var player = {
        max_speed: PLAYER_MAX_SPEED,
        sprites: newimagearray("res/ship1.png", "res/ship2.png"),
        framerate: 60,
        lives: PLAYER_LIVES,
        keyboard: {"w": false, "a": false, "s": false, "d": false}
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
                if (item.collides_with_player()) {
                    this.alive = false;
                    this.lives -= 1;
                    this.crack();
                    mixer("enemy_death");
                    break;
                }
            }
        }
    };

    player.crack = function () {

        var params = {};
        params.harmless = true;
        params.death_sound = null;
        params.age = 0;
        params.x = this.x;
        params.y = this.y;
        params.speedy = this.speedy;
        params.damage = function () {
            this.age += 1;
            if (this.age > 60) {
                this.hp = 0;
            }
        };

        var cracked_left = new_entity(params);
        var cracked_right = new_entity(params);

        cracked_left.sprites = newimagearray("res/cracked_left.png");
        cracked_right.sprites = newimagearray("res/cracked_right.png");

        cracked_left.speedx = this.speedx - 2;
        cracked_right.speedx = this.speedx + 2;

        sim.entities.push(cracked_left);
        sim.entities.push(cracked_right);
    };

    player.draw = function () {

        if (this.immune_timer > 0) {
            draw_circle(this.x, this.y, this.immune_timer / 2 + 30, "#ccffcc");
        }

        var sprite_index = Math.floor(sim.iteration_total / this.framerate) % this.sprites.length;
        var sprite = this.sprites[sprite_index];
        virtue.drawImage(sprite, this.x - sprite.width / 2, this.y - sprite.height / 2);
    };

    return player;
}
