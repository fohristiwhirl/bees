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

    var n;
    var keys;

    if (params) {
        keys = Object.keys(params);
        for (n = 0; n < keys.length; n += 1) {
            entity[keys[n]] = params[keys[n]];
        }
    }

    return entity;
}

function new_stupid(params) {
    var stupid = new_entity(params);
    stupid.sprites = sprites.stupid;
    stupid.score = 10;
    return stupid;
}

function new_shot(params) {
    var shot = new_entity(params);
    shot.sprites = sprites.shot;
    shot.low_priority = true;

    shot.damage = function () {
        return;
    };

    return shot;
}

function new_shooter(params) {
    var shooter = new_entity(params);
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

        var new_shot;
        var vector;

        if (this.can_shoot()) {

            new_shot = this.shot_constructor();     // Don't pass parameters, so we can easily use lambdas that modify the shot.
            new_shot.x = this.x;
            new_shot.y = this.y;

            vector = this.unit_vector_to_player();
            new_shot.speedx = vector[0] * this.shotspeed;
            new_shot.speedy = vector[1] * this.shotspeed;

            sim.entities.push(new_shot);
        }
    };

    return shooter;
}

function new_chaser(params) {
    var chaser = new_entity(params);
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

        if (this.finished && Math.abs(this.speedx) < 1 && Math.abs(this.speedy) < 1) {
            if (this.x > canvas.width / 2) {
                this.speedx += 0.4;
            } else {
                this.speedx -= -0.4;
            }
        }

        this.x += this.speedx;
        this.y += this.speedy;
    };

    chaser.draw = function () {
        if (sim.player.alive && this.finished === false) {
            draw_line(this.x, this.y, sim.player.x, sim.player.y, "#ff0000");
        }
        base_entity.draw.apply(this);
    };

    return chaser;
}

function new_bouncer(params) {              // Not an actual enemy, but boulder and apple inherit from this.
    var bouncer = new_entity(params);

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

    return bouncer;
}

function new_boulder(params) {
    var boulder = new_bouncer(params);
    boulder.sprites = sprites.boulder;
    boulder.scary = true;

    shot.damage = function () {
        return;
    };

    return boulder;
}

function new_apple(params) {
    var apple = new_bouncer(params);
    apple.sprites = sprites.apple;
    apple.low_priority = true;
    apple.harmless = true;
    apple.is_apple = true;

    apple.damage = function () {

        // Damage from bees...

        base_entity.damage.apply(this);

        // Or from player...

        if (this.hp > 0) {
            if (this.collides_with_player()) {
                this.hp = 0;
            }
        }
    };

    return apple;
}
