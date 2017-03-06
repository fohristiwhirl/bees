"use strict";

function setup_sim() {

    sim.level = 1;
    sim.iteration = 0;
    sim.score = 0;

    sim.entities = [];

    sim.player = make_player();
    sim.bees = make_bees();
    sim.stars = make_stars();

    sim.player.reset();
    sim.bees.reset();

    // ---------------------------------------------------------------------------------------------
    // GAME LOGIC

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

        // Add new enemies...

        this.entities.push.apply(this.entities, enemy_gen());    // Array concat in place.

        // Move and damage entities...

        arr = this.entities;
        len = this.entities.length;
        for (n = len - 1; n >= 0; n -= 1) {
            item = arr[n];
            item.move();
            item.damage();

            oob = item.out_of_bounds();

            if (item.hp <= 0 || oob) {
                arr.splice(n, 1);           // Deletes from array in place; the reference arr thus works.
                if (oob === false) {
                    if (item.death_sound !== null && item.death_sound !== undefined) {
                        mixer.play(item.death_sound);
                    }
                    this.score += item.score;
                }
            }
        }

        // Move stars...

        this.stars.move();

        // Move bees...

        arr = this.bees;
        len = this.bees.length;
        for (n = 0; n < len; n += 1) {
            arr[n].move();
        }

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
            document.title = "The Bees (score: " + this.score.toString() + ")";
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

        // Draw stars...

        this.stars.draw();

        // Draw bees...

        arr = this.bees;
        len = this.bees.length;
        for (n = 0; n < len; n += 1) {
            arr[n].draw();
        }

        // Draw entities...

        arr = this.entities;
        len = this.entities.length;
        for (n = 0; n < len; n += 1) {
            arr[n].draw();
        }

        // Draw player...

        if (this.player.alive) {
            this.player.draw();
        }

        // Carry on...

        var that = this;
        setTimeout(function () {
            that.update();
        }, 0);
    };
}
