"use strict";

function setup_sim() {

    sim.level = 1;
    sim.iteration = 0;
    sim.iteration_total = 0;        // Not affected by level change.
    sim.score = 0;

    sim.entities = [];

    sim.player = make_player();
    sim.bees = make_bees();
    sim.stars = make_stars();

    sim.player.reset();
    sim.bees.reset();

    var life_sprite = new Image();
    life_sprite.src = "res/ship_small.png";

    // ---------------------------------------------------------------------------------------------

    sim.boss_present = function () {
        var boss_present = false;
        var n;
        for (n = 0; n < this.entities.length; n += 1) {
            if (this.entities[n].is_boss) {
                boss_present = true;
                break;
            }
        }

        return boss_present;
    };

    sim.next_level = function () {
        this.level += 1;
        this.iteration = 0;
    };

    sim.update = function () {

        var arr;
        var len;
        var item;
        var n;
        var oob;

        this.iteration += 1;
        this.iteration_total += 1;

        // Add new enemies...

        this.entities.push.apply(this.entities, enemy_gen());    // Array concat in place.

        // Move and damage entities...

        arr = this.entities;
        len = this.entities.length;
        for (n = len - 1; n >= 0; n -= 1) {
            item = arr[n];
            item.move();
            item.act();
            item.damage();

            oob = item.out_of_bounds();

            if (item.hp <= 0 || oob) {
                arr.splice(n, 1);           // Deletes from array in place; the reference arr thus works.
                if (oob === false) {
                    if (item.death_sound !== null && item.death_sound !== undefined) {
                        mixer(item.death_sound);
                    }
                    this.score += item.score;
                }
            }
        }

        // Move stars and bees...

        this.stars.move();
        this.bees.move();

        // Update player...

        if (this.player.alive) {

            this.player.move();
            this.player.damage();

        } else {

            if (this.player.lives > 0) {
                this.player.respawn_timer -= 1;
                if (this.player.respawn_timer < 0) {
                    this.player.reset();
                    this.bees.reset();
                }
            }
        }

        // Carry on...

        var that = this;
        requestAnimationFrame(function () {
            that.frame();
        });
    };

    // ---------------------------------------------------------------------------------------------
    // DRAW LOGIC

    sim.frame = function () {

        var arr;
        var len;
        var n;
        var new_width;
        var new_height;

        // Update title with score sometimes...

        if (this.iteration % 10 === 7) {
            document.title = "L: " + this.level.toString() + "  S: " + this.score.toString() + "  E: " + this.entities.length.toString() + "";
        }

        // Adjust canvas size if needed...

        if (this.iteration % 60 === 0) {

            new_width = window.innerWidth;
            new_height = window.innerHeight;

            if (new_width !== canvas.width || new_height !== canvas.height) {
                canvas.width = new_width;
                canvas.height = new_height;
            }
        }

        // Clear canvas...

        virtue.clearRect(0, 0, canvas.width, canvas.height);

        // Draw stars and bees...

        this.stars.draw();
        this.bees.draw();

        // Draw entities...

        arr = this.entities;
        len = this.entities.length;
        for (n = 0; n < len; n += 1) {
            if (arr[n].low_priority) {
                arr[n].draw();                          // Low priority entities first (so they're below).
            }
        }
        for (n = 0; n < len; n += 1) {
            if (arr[n].low_priority === false || arr[n].low_priority === undefined) {
                arr[n].draw();                          // High priority entities last (so they've above).
            }
        }

        // Draw player...

        if (this.player.alive) {
            this.player.draw();
        }

        // Draw lives...

        if (this.player.lives > 1) {
            for (n = 1; n < this.player.lives; n += 1) {
                virtue.drawImage(life_sprite, n * life_sprite.width - life_sprite.width / 2, life_sprite.height / 2);
            }
        }

        // Carry on...

        var that = this;
        setTimeout(function () {
            that.update();
        }, 0);
    };
}
