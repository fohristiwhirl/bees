"use strict";

function new_entity(params) {

    var entity = {
        x: 0,
        y: 0,
        speedx: 0,
        speedy: 0,
        hp: 1,
        sprites: sprites.diamond,
        framerate: 60,
        scary: false,
        harmless: false,
        death_sound: "enemy_death",
        low_priority: false,
        is_boss: false,
        score: 0
    };

    entity.draw = function () {
        var sprite_index;
        var sprite;

        sprite_index = Math.floor(sim.iteration_total / this.framerate) % this.sprites.length;
        sprite = this.sprites[sprite_index];
        virtue.drawImage(sprite, this.x - sprite.width / 2, this.y - sprite.height / 2);
    };

    entity.move = function () {
        this.x += this.speedx;
        this.y += this.speedy;
    };

    entity.act = function () {
        return;
    };

    entity.out_of_bounds = function () {

        // Called each iteration to check whether the entity should be removed as out of bounds.
        // Bosses should override this with a simple "return false" function.

        if (this.x < -200 || this.x > canvas.width + 200 || this.y < -200 || this.y > canvas.height + 200) {
            return true;
        }
        return false;
    };

    entity.damage = function () {

        // Apply damage to this entity, if needed. Default is to check proximity to bees.

        var n;
        var arr = sim.bees;
        var len = sim.bees.length;
        var bee;
        var dx;
        var dy;

        for (n = 0; n < len; n += 1) {
            bee = arr[n];
            dx = Math.abs(bee.x - this.x);
            dy = Math.abs(bee.y - this.y);
            if (dx < this.sprites[0].width / 2 + MARGIN_OF_ERROR) {
                if (dy < this.sprites[0].height / 2 + MARGIN_OF_ERROR) {
                    this.hp -= 1;
                }
            }
        }

        if (this.hp < 0) {
            this.hp = 0;
        }
    };

    entity.unit_vector_to_player = function () {
        return unit_vector(this.x, this.y, sim.player.x, sim.player.y);
    };

    entity.collides_with_player = function () {
        var distance = get_distance(this.x, this.y, sim.player.x, sim.player.y);
        if (distance < sim.player.sprites[0].width / 2 + this.sprites[0].width / 2 - MARGIN_OF_ERROR) {
            return true;
        }
        return false;
    };

    entity.list_scary_points = function () {       // List all points that should scare the bees.
        if (this.scary) {
            return [[this.x, this.y]];
        }
        return [];
    };

    entity.set_params = function (params) {
        var n;
        var keys;

        if (params) {
            keys = Object.keys(params);
            for (n = 0; n < keys.length; n += 1) {
                entity[keys[n]] = params[keys[n]];
            }
        }
    };

    entity.set_params(params);
    return entity;
}

function new_stupid(params) {
    var stupid = new_entity();
    stupid.sprites = sprites.stupid;
    stupid.score = 10;

    stupid.set_params(params);
    return stupid;
}

function new_shot(params) {
    var shot = new_entity();
    shot.sprites = sprites.shot;
    shot.low_priority = true;

    shot.damage = function () {
        return;
    };

    shot.set_params(params);
    return shot;
}

function new_shooter(params) {
    var shooter = new_entity();
    shooter.sprites = sprites.shooter;
    shooter.score = 100;
    shooter.shot_constructor = new_shot;            // Function to use when constructing a shot. e.g. use new_chaser to shoot chasers.
    shooter.shotspeed = 5;
    shooter.shotrate = 50;
    shooter.age = 0;

    shooter.can_shoot = function () {
        if (this.age % this.shotrate === Math.floor(this.shotrate / 2) && sim.player.alive) {
            if (this.x > 0 && this.x < canvas.width && this.y > 0 && this.y < canvas.height) {
                return true;
            }
        }
        return false;
    };

    shooter.act = function () {
        this.age += 1;

        var s;
        var vector;

        if (this.can_shoot()) {

            s = this.shot_constructor();     // Don't pass parameters, so we can easily use lambdas that modify the shot.
            s.x = this.x;
            s.y = this.y;

            vector = this.unit_vector_to_player();
            s.speedx = vector[0] * this.shotspeed;
            s.speedy = vector[1] * this.shotspeed;

            sim.entities.push(s);
        }
    };

    shooter.set_params(params);
    return shooter;
}

function new_chaser(params) {
    var chaser = new_entity();
    chaser.sprites = sprites.chaser;
    chaser.score = 100;
    chaser.finished = false;
    chaser.chase_speed = 7;

    chaser.move = function () {

        if (sim.player.alive && this.finished === false) {
            var vector = this.unit_vector_to_player();
            this.speedx = vector[0] * this.chase_speed;
            this.speedy = vector[1] * this.chase_speed;
        } else {
            this.finished = true;
        }

        // Make sure that finished chasers eventually go out of bounds to get removed...

        if (this.finished && Math.abs(this.speedx) < 3 && Math.abs(this.speedy) < 3) {
            if (this.x > canvas.width / 2) {
                this.speedx += 0.4;
            } else {
                this.speedx -= -0.4;
            }
        }

        this.x += this.speedx;
        this.y += this.speedy;
    };

    chaser.__super__draw = chaser.draw;

    chaser.draw = function () {
        if (sim.player.alive && this.finished === false) {
            draw_line(this.x, this.y, sim.player.x, sim.player.y, "#ff0000");
        }
        this.__super__draw();
    };

    chaser.set_params(params);
    return chaser;
}

function new_bouncer(params) {              // Not an actual enemy, but boulder and apple inherit from this.
    var bouncer = new_entity();

    bouncer.lifespan = 500;
    bouncer.age = 0;

    bouncer.move = function () {
        this.age += 1;
        if (this.age < this.lifespan) {      // Only the young can bounce.
            if (this.x < this.sprites[0].width / 2) {
                this.speedx = Math.abs(this.speedx);
            }
            if (this.x > canvas.width - this.sprites[0].width / 2) {
                this.speedx = Math.abs(this.speedx) * -1;
            }
            if (this.y < this.sprites[0].height / 2) {
                this.speedy = Math.abs(this.speedy);
            }
            if (this.y > canvas.height - this.sprites[0].height / 2) {
                this.speedy = Math.abs(this.speedy) * -1;
            }
        }
        this.x += this.speedx;
        this.y += this.speedy;
    };

    bouncer.set_params(params);
    return bouncer;
}

function new_boulder(params) {
    var boulder = new_bouncer();
    boulder.sprites = sprites.boulder;
    boulder.scary = true;

    boulder.damage = function () {
        return;
    };

    boulder.set_params(params);
    return boulder;
}

function new_apple(params) {
    var apple = new_bouncer();
    apple.sprites = sprites.apple;
    apple.low_priority = true;
    apple.harmless = true;
    apple.is_apple = true;

    apple.__super__damage = apple.damage;

    apple.damage = function () {

        // Damage from bees...

        this.__super__damage();

        // Or from player...

        if (this.hp > 0) {
            if (this.collides_with_player()) {
                this.hp = 0;
            }
        }
    };

    apple.set_params(params);
    return apple;
}

function new_pusher(params) {
    var pusher = new_entity();
    pusher.sprites = sprites.pusher;

    pusher.score = 250;
    pusher.scary = true;
    pusher.force = 20000;
    pusher.harmless = true;

    pusher.damage = function () {
        return;
    };

    pusher.act = function () {
        var dx;
        var dy;
        var distance;
        var distance_squared;
        var adjusted_force;

        if (sim.player.alive) {

            dx = (sim.player.x - this.x);
            dy = (sim.player.y - this.y);
            distance_squared = dx * dx + dy * dy;
            distance = Math.sqrt(distance_squared);
            if (distance > 0.01 && distance < 100) {
                adjusted_force = this.force / (distance_squared * distance);
                sim.player.speedx += dx * adjusted_force;
                sim.player.speedy += dy * adjusted_force;
            }
        }
    };

    pusher.__super__draw = pusher.draw;

    pusher.draw = function () {
        draw_circle(this.x, this.y, sim.iteration_total % 30 + 30, "#003366");
        this.__super__draw();
    };

    pusher.set_params(params);
    return pusher;
}

function new_minor_shooter_shooter(params) {
    var mss = new_shooter();
    mss.sprites = sprites.shooter_shooter;
    mss.shot_constructor = new_shooter;
    mss.shotrate = 85;

    mss.set_params(params);
    return mss;
}
