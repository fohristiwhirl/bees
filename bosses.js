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
    h = 10;

    virtue.strokeStyle = "#ff0000";
    virtue.beginPath();
    virtue.rect(x1,y1,w,h);
    virtue.stroke();

    // Filled rect...

    virtue.fillStyle = "#ff0000";
    virtue.beginPath();
    virtue.rect(x1, y1, w * fraction, h);
    virtue.fill();
}

function make_revolver() {

    var n;
    var revolver = Object.create(base_entity);
    var new_sub;

    var base_sub = Object.create(base_shooter);
    base_sub.sprites = [newimage("res/skull.png")];

    revolver.hp = 0;
    revolver.score = 1000;
    revolver.subentities = [];
    revolver.death_sound = null;    // We do our own sounds, so this means the main loop doesn't.

    for (n = 0; n < 3; n += 1) {
        new_sub = Object.create(base_sub);
        new_sub.angle = 2.094 * n;
        new_sub.hp = 60;

        revolver.hp += new_sub.hp;

        revolver.subentities.push(new_sub);
    }

    var initial_health = revolver.hp;
    var last_sound_iteration = sim.iteration;

    revolver.get_total_health = function () {
        var n;
        var total_health = 0;
        for (n = 0; n < this.subentities.length; n += 1) {
            if (this.subentities[n].hp > 0) {
                total_health += this.subentities[n].hp;
            }
        }
        return total_health;
    }

    revolver.draw = function () {
        var n;
        for (n = 0; n < this.subentities.length; n += 1) {
            this.subentities[n].draw();
        }
        draw_boss_hitpoints(this.get_total_health() / initial_health);
    };

    revolver.damage = function () {
        var n;
        for (n = this.subentities.length - 1; n >= 0; n -= 1) {     // Reversed so we can pop.
            if (this.subentities[n].damage()) {                     // The call applies damage to the subentities, returning damage taken.
                if (sim.iteration - last_sound_iteration > 5) {
                     last_sound_iteration = sim.iteration;
                     mixer.play("click");
                }
            }
            if (this.subentities[n].hp <= 0) {
                this.subentities.splice(n, 1);
                mixer.play("enemy_death");
            }
        }
        revolver.hp = this.get_total_health();
    };

    revolver.out_of_bounds = function () {
        return false;
    };

    revolver.collides_with_player = function () {
        var dx;
        var dy;
        var n;
        for (n = 0; n < this.subentities.length; n += 1) {
            if (this.subentities[n].collides_with_player()) {
                return true;
            }
        }
        return false;
    }

    revolver.move = function () {
        var n;
        var sub;

        if (this.x < 100) {
            this.speedx = Math.abs(this.speedx);
        }
        if (this.x > canvas.width - 100) {
            this.speedx = Math.abs(this.speedx) * -1;
        }
        if (this.y < 100) {
            this.speedy = Math.abs(this.speedy);
        }
        if (this.y > canvas.height - 100) {
            this.speedy = Math.abs(this.speedy) * -1;
        }
        this.x += this.speedx;
        this.y += this.speedy;

        for (n = 0; n < this.subentities.length; n += 1) {
            sub = this.subentities[n];
            sub.move();                                     // Uses the base_shooter's move() method...
            sub.x = Math.cos(sub.angle) * 150 + this.x;     // But now overriding the resulting
            sub.y = Math.sin(sub.angle) * 150 + this.y;     // x and y values.
            sub.angle += 0.025;
        }
    }

    revolver.x = canvas.width + 64;
    revolver.y = canvas.height / 2;
    revolver.speedx = -2;
    revolver.speedy = -1;

    return revolver;
}
