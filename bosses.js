"use strict";

// ---------------------------------------------------------------------------------------------
// REVOLVER

function make_revolver() {

    var i;
    var revolver = make(Entity);
    var new_sub;

    revolver.is_boss = true;
    revolver.score = 1000;
    revolver.subentities = [];
    revolver.death_sound = null;        // We do our own sounds, so this means the main loop doesn't.

    for (i = 0; i < 3; i += 1) {

        new_sub = make(Shooter, {

            sprites: sprites.skull,
            framerate: 15,
            hp: 60,
            angle: 2.094 * i,

            shot_constructor: function () {return make(Shot, {sprites: sprites.shot_blue});}
        });

        revolver.subentities.push(new_sub);
    }

    Object.defineProperty(revolver, "hp", {                                 // hp getter.
        get: function () {
            var n;
            var total_health = 0;
            for (n = 0; n < this.subentities.length; n += 1) {
                total_health += Math.max(0, this.subentities[n].hp);        // Count negatives as zero.
            }
            return total_health;
        }
    });

    revolver.initial_health = revolver.hp;
    revolver.last_sound_iteration = 0;

    revolver.draw = function () {
        var n;

        for (n = 1; n < this.subentities.length; n += 1) {                  // Draw lightning if len >= 2
            draw_lightning(
                this.subentities[n].x,
                this.subentities[n].y,
                this.subentities[n - 1].x,
                this.subentities[n - 1].y,
                "#009999"
            );
        }
        if (this.subentities.length > 2) {
            draw_lightning(
                this.subentities[0].x,
                this.subentities[0].y,
                this.subentities[this.subentities.length - 1].x,
                this.subentities[this.subentities.length - 1].y,
                "#009999"
            );
        }

        for (n = 0; n < this.subentities.length; n += 1) {
            this.subentities[n].draw();
        }

        draw_boss_hitpoints(this.hp / this.initial_health);
    };

    revolver.damage = function () {
        var n;
        var hp_before = this.hp;

        for (n = this.subentities.length - 1; n >= 0; n -= 1) {             // Reversed so we can pop.
            this.subentities[n].damage();
            if (this.subentities[n].hp <= 0) {
                this.subentities.splice(n, 1);
                mixer("enemy_death");
            }
        }

        if (this.hp !== hp_before) {                                        // We took damage.
            if (sim.iteration_total - this.last_sound_iteration > 3) {
                this.last_sound_iteration = sim.iteration_total;
                mixer("click");
            }
        }
    };

    revolver.out_of_bounds = function () {
        return false;
    };

    revolver.collides_with_player = function () {
        var n;
        for (n = 0; n < this.subentities.length; n += 1) {
            if (this.subentities[n].collides_with_player()) {
                return true;
            }
        }
        return false;
    };

    revolver.move = function () {
        var n;
        var sub;

        // Move the hidden core...

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

        // Place the subentities...

        for (n = 0; n < this.subentities.length; n += 1) {
            sub = this.subentities[n];
            sub.x = Math.cos(sub.angle) * 150 + this.x;
            sub.y = Math.sin(sub.angle) * 150 + this.y;
            sub.angle += 0.025;
        }
    };

    revolver.act = function () {
        var n;
        for (n = 0; n < this.subentities.length; n += 1) {
            this.subentities[n].act();
        }
    };

    revolver.x = canvas.width + 200;
    revolver.y = canvas.height / 2;
    revolver.speedx = -2;
    revolver.speedy = -1;

    return revolver;
}

// ---------------------------------------------------------------------------------------------
// SHOOTER SHOOTER

function make_shooter_shooter() {

    var shooter_shooter = make(Shooter);
    shooter_shooter.sprites = sprites.shooter_shooter;

    shooter_shooter.is_boss = true;
    shooter_shooter.shot_constructor = function () {return make(Shooter, {score: 0});};
    shooter_shooter.shotspeed = 4;
    shooter_shooter.shotrate = 40;
    shooter_shooter.hp = 350;
    shooter_shooter.score = 1000;
    shooter_shooter.x = canvas.width + 32;
    shooter_shooter.y = Math.random() * canvas.height;
    shooter_shooter.speedx = -2;
    shooter_shooter.speedy = -1;
    shooter_shooter.last_sound_iteration = 0;
    shooter_shooter.initial_health = shooter_shooter.hp;

    shooter_shooter.move = function () {
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
    };

    shooter_shooter.act = function () {
        if (Math.floor(sim.iteration / 200) % 2 === 0) {
            this.scary = true;
        } else {
            this.scary = false;
            Shooter.act.call(this);
        }
    };

    shooter_shooter.draw = function () {
        if (this.scary) {
            draw_circle(this.x, this.y, 45, "#ccffcc");
        }
        Entity.draw.call(this);

        draw_boss_hitpoints(this.hp / this.initial_health);
    };

    shooter_shooter.damage = function () {
        var hp_before = this.hp;

        if (this.scary) {                   // Take no damage when shield up.
            return;
        }

        Entity.damage.call(this);

        if (this.hp !== hp_before) {                                        // We took damage.
            if (sim.iteration_total - this.last_sound_iteration > 3) {
                this.last_sound_iteration = sim.iteration_total;
                mixer("click");
            }
        }
    };

    shooter_shooter.out_of_bounds = function () {
        return false;
    };

    return shooter_shooter;
}

// ---------------------------------------------------------------------------------------------
// SNAKE (so-called for historical reasons; sprite is actually the player sprite)

function make_snake() {

    var snake = make(Entity);
    snake.sprites = sprites.snake;

    snake.is_boss = true;
    snake.score = 1000;
    snake.scary = true;
    snake.hp = 1500;
    snake.max_health = 3000;
    snake.target = null;
    snake.accel_mod = 2;
    snake.max_speed = 8;

    snake.damage = function () {
        if (this.hp > 1) {
            this.scary = true;
            this.hp -= 1;
        } else {
            this.scary = false;
            Entity.damage.call(this);   // When at 1 hp, the shield is down and we can take damage.
        }
    };

    snake.out_of_bounds = function () {
        return false;
    };

    snake.draw = function () {
        if (this.hp > 1) {
            draw_circle(this.x, this.y, 45, "#ccffcc");
        }
        Entity.draw.call(this);
        draw_boss_hitpoints(this.hp / this.max_health);
    };

    snake.move = function () {
        var vector;
        var vecx;
        var vecy;

        // Chase target...

        if (this.target !== null) {
            vector = unit_vector(this.x, this.y, this.target.x, this.target.y);
            vecx = vector[0];
            vecy = vector[1];
            this.speedx += vecx * Math.random() * 2 * this.accel_mod / 2;
            this.speedy += vecy * Math.random() * 2 * this.accel_mod / 2;
        }

        // Throttle speed...

        var speed = Math.sqrt(this.speedx * this.speedx + this.speedy * this.speedy);
        if (speed > this.max_speed) {
            this.speedx *= this.max_speed / speed;
            this.speedy *= this.max_speed / speed;
        }

        // Update...

        this.x += this.speedx;
        this.y += this.speedy;
    };

    snake.act = function () {
        var distance;
        var n;
        var len;
        var arr;
        var new_ent;
        var vector;

        // Set target to null if it has no hp...

        if (this.target !== null) {
            if (this.target.hp <= 0) {
                this.target = null;
            }
        }

        // Find new target if needed...

        if (this.target === null) {
            arr = sim.entities;
            len = sim.entities.length;
            for (n = 0; n < len; n += 1) {
                if (arr[n].is_apple) {          // Will be undefined on most entities
                    if (arr[n].hp > 0) {
                        this.target = arr[n];
                        break;
                    }
                }
            }
        }

        // If we collide with target, kill it and gain health...

        if (this.target !== null) {
            distance = get_distance(this.x, this.y, this.target.x, this.target.y);
            if (distance < 32) {
                this.target.hp = 0;
                this.hp += 120;
                this.hp = Math.min(this.hp, this.max_health);
            }
        }

        // Shoot sometimes...

        if (sim.iteration_total % 45 === 44) {
            // Some randomness on the shot...
            vector = unit_vector(this.x, this.y, sim.player.x + Math.random() * 400 - 200, sim.player.y + Math.random() * 400 - 200);
            new_ent = make(Shot);
            new_ent.x = this.x;
            new_ent.y = this.y;
            new_ent.speedx = vector[0] * 10;
            new_ent.speedy = vector[1] * 10;
            sim.entities.push(new_ent);
        }
    };

    snake.x = canvas.width + 32;
    snake.y = Math.random() * canvas.height;
    snake.speedx = -2;
    snake.speedy = -1;

    return snake;
}
