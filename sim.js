"use strict";

function setup_sim() {

    sim.iteration = 0;
    sim.score = 0;

    sim.entities = [];

    sim.player = make_player();
    sim.bees = make_bees();

    sim.player.reset();
    sim.bees.reset();

    // ---------------------------------------------------------------------------------------------
    // GAME LOGIC

    sim.update = function () {

        var arr;
        var len;
        var item;
        var n;
        var oob;

        this.iteration += 1;

        // Add new enemies...

        this.entities.push.apply(this.entities, enemy_gen(this.iteration));    // Array concat in place.

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
                        mixer.play_sound(item.death_sound);
                    }
                    this.score += item.score;
                }
            }
        }

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

    sim.frame = function () {

        var arr;
        var len;
        var item;
        var n;
        var sprite_index;
        var sprite;
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

        virtue.clearRect(0, 0, canvas.width, canvas.height);

        // Draw bees...

        virtue.lineWidth = 3;

        arr = this.bees;
        len = this.bees.length;
        for (n = 0; n < len; n += 1) {
            item = arr[n];
            virtue.strokeStyle = item.colour;
            virtue.beginPath();
            virtue.moveTo(item.oldx, item.oldy);
            virtue.lineTo(item.x, item.y);
            virtue.stroke();
        }

        // Draw entities...

        arr = this.entities;
        len = this.entities.length;
        for (n = 0; n < len; n += 1) {
            arr[n].draw();
        }

        // Draw player...

        if (this.player.alive) {
            sprite_index = Math.floor(this.iteration / this.player.framerate) % this.player.sprites.length;
            sprite = this.player.sprites[sprite_index];
            virtue.drawImage(sprite, this.player.x - sprite.width / 2, this.player.y - sprite.height / 2);
        }

        // Carry on...

        var that = this;
        setTimeout(function () {
            that.update();
        }, 0);
    };
}
