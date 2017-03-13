"use strict";

function make(base, params) {

    // More or less equivalent to Object.assign(Object.create(base), params);
    // But supporting IE9+

    var that = Object.create(base);
    var n;
    var keys;
    if (params) {                       // Might be undefined.
        keys = Object.keys(params);
        for (n = 0; n < keys.length; n += 1) {
            that[keys[n]] = params[keys[n]];
        }
    }
    return that;
}

/* ------------------------------------------------------------------------------------------ *\

    All the objects defined here are used as prototypes. They get created once, then future
    objects have their [[Prototype]] point to them. To make such an "instance", use:

                make(type, params);

    Where params is an object of properties to be added (or overwritten) in the thing. The
    params argument is optional, however.

\* ------------------------------------------------------------------------------------------ */

var Entity = make(null, {

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
    score: 0,

    draw: function () {
        var sprite_index;
        var sprite;

        sprite_index = Math.floor(sim.iteration_total / this.framerate) % this.sprites.length;
        sprite = this.sprites[sprite_index];
        virtue.drawImage(sprite, this.x - sprite.width / 2, this.y - sprite.height / 2);
    },

    move: function () {
        this.x += this.speedx;
        this.y += this.speedy;
    },

    act: function () {
        return;
    },

    out_of_bounds: function () {

        // Called each iteration to check whether the entity should be removed as out of bounds.
        // Bosses should override this with a simple "return false" function.

        if (this.x < -200 || this.x > canvas.width + 200 || this.y < -200 || this.y > canvas.height + 200) {
            return true;
        }
        return false;
    },

    damage: function () {

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
    },

    unit_vector_to_player: function () {
        return unit_vector(this.x, this.y, sim.player.x, sim.player.y);
    },

    collides_with_player: function () {
        var distance = get_distance(this.x, this.y, sim.player.x, sim.player.y);
        if (distance < sim.player.sprites[0].width / 2 + this.sprites[0].width / 2 - MARGIN_OF_ERROR) {
            return true;
        }
        return false;
    },

    list_scary_points: function () {       // List all points that should scare the bees.
        if (this.scary) {
            return [[this.x, this.y]];
        }
        return [];
    },
});

// ---------------------------------------------------------------------------------------------

var Stupid = make(Entity, {

    sprites: sprites.stupid,
    score: 10

});

// ---------------------------------------------------------------------------------------------

var Shot = make(Entity, {

    sprites: sprites.shot,
    low_priority: true,

    damage: function () {
        return;
    }
});

// ---------------------------------------------------------------------------------------------

var Shooter = make(Entity, {

    sprites: sprites.shooter,
    score: 100,
    shotspeed: 5,
    shotrate: 50,
    age: 0,

    shot_constructor: function () {
        return make(Shot);
    },

    can_shoot: function () {
        if (this.age % this.shotrate === Math.floor(this.shotrate / 2) && sim.player.alive) {
            if (this.x > 0 && this.x < canvas.width && this.y > 0 && this.y < canvas.height) {
                return true;
            }
        }
        return false;
    },

    act: function () {
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
    }
});

// ---------------------------------------------------------------------------------------------

var Chaser = make(Entity, {

    sprites: sprites.chaser,
    score: 100,
    finished: false,
    chase_speed: 7,

    move: function () {

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
    },

    draw: function () {
        if (sim.player.alive && this.finished === false) {
            draw_line(this.x, this.y, sim.player.x, sim.player.y, "#ff0000");
        }
        Entity.draw.call(this);
    }
});

// ---------------------------------------------------------------------------------------------

var Bouncer = make(Entity, {

    lifespan: 500,
    age: 0,

    move: function () {
        this.age += 1;
        if (this.age < this.lifespan) {                     // Only the young can bounce.
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
    }
});

// ---------------------------------------------------------------------------------------------

var Boulder = make(Bouncer, {

    sprites: sprites.boulder,
    scary: true,

    damage: function () {
        return;
    }
});

// ---------------------------------------------------------------------------------------------

var Apple = make(Bouncer, {

    sprites: sprites.apple,
    low_priority: true,
    harmless: true,
    is_apple: true,

    damage: function () {

        // Damage from bees...

        Entity.damage.call(this);

        // Or from player...

        if (this.hp > 0) {
            if (this.collides_with_player()) {
                this.hp = 0;
            }
        }
    }
});

// ---------------------------------------------------------------------------------------------

var Pusher = make(Entity, {

    sprites: sprites.pusher,
    scary: true,
    force: 20000,
    harmless: true,

    damage: function () {
        return;
    },

    act: function () {
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
    },

    draw: function () {
        draw_circle(this.x, this.y, sim.iteration_total % 30 + 30, "#003366");
        Entity.draw.call(this);
    }
});

// ---------------------------------------------------------------------------------------------

var Mss = make(Shooter, {           // "Minor shooter shooter"

    sprites: sprites.shooter_shooter,
    score: 300,
    shotrate: 85,
    shotspeed: 4,

    shot_constructor: function () {
        return make(Shooter);
    }
});
