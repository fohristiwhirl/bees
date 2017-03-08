"use strict";

// ---------------------------------------------------------------------------------------------
// BASE ENTITY

var base_entity = {
    x: 0,
    y: 0,
    speedx: 0,
    speedy: 0,
    hp: 1,
    sprites: newimagearray("res/diamond.png"),
    framerate: 60,
    scary: false,
    harmless: false,
    death_sound: "enemy_death",
    low_priority: false,
    score: 0
};

base_entity.draw = function () {
    var sprite_index;
    var sprite;

    sprite_index = Math.floor(sim.iteration / this.framerate) % this.sprites.length;
    sprite = this.sprites[sprite_index];
    virtue.drawImage(sprite, this.x - sprite.width / 2, this.y - sprite.height / 2);
};

base_entity.move = function () {
    this.x += this.speedx;
    this.y += this.speedy;
};

base_entity.act = function () {
    return;
};

base_entity.out_of_bounds = function () {
    if (this.x < -200 || this.x > canvas.width + 200 || this.y < -200 || this.y > canvas.height + 200) {
        return true;
    }
    return false;
};

base_entity.damage = function () {
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

base_entity.unit_vector_to_player = function () {
    return unit_vector(this.x, this.y, sim.player.x, sim.player.y);
};

base_entity.collides_with_player = function () {
    var distance = get_distance(this.x, this.y, sim.player.x, sim.player.y);
    if (distance < sim.player.sprites[0].width / 2 + this.sprites[0].width / 2 - MARGIN_OF_ERROR) {
        return true;
    }
    return false;
};

base_entity.list_scary_points = function () {       // List all points that should scare the bees.
    if (this.scary) {
        return [[this.x, this.y]];
    }
    return [];
};

// ---------------------------------------------------------------------------------------------
// STUPID

var base_stupid = Object.create(base_entity);
base_stupid.sprites = newimagearray("res/stupid.png");
base_stupid.score = 10;

// ---------------------------------------------------------------------------------------------
// SHOT

var base_shot = Object.create(base_entity);
base_shot.sprites = newimagearray("res/shot.png");
base_shot.low_priority = true;

base_shot.damage = function () {
    return;
};

// ---------------------------------------------------------------------------------------------
// SHOT (BLUE VERSION)

var base_shot_blue = Object.create(base_shot);
base_shot_blue.sprites = newimagearray("res/shot_blue.png");

// ---------------------------------------------------------------------------------------------
// SHOOTER

var base_shooter = Object.create(base_entity);
base_shooter.sprites = newimagearray("res/shooter.png");
base_shooter.score = 100;

base_shooter.thing_we_shoot = base_shot;
base_shooter.shotspeed = 5;
base_shooter.shotrate = 50;
base_shooter.age = 0;

base_shooter.can_shoot = function () {
    if (this.age % this.shotrate === Math.floor(this.shotrate / 2) && sim.player.alive) {
        if (this.x > 0 && this.x < canvas.width && this.y > 0 && this.y < canvas.height) {
            return true;
        }
    }
    return false;
};

base_shooter.act = function () {
    this.age += 1;

    var new_shot;
    var vector;

    if (this.can_shoot()) {

        new_shot = Object.create(this.thing_we_shoot);
        new_shot.x = this.x;
        new_shot.y = this.y;

        vector = this.unit_vector_to_player();
        new_shot.speedx = vector[0] * this.shotspeed;
        new_shot.speedy = vector[1] * this.shotspeed;

        sim.entities.push(new_shot);
    }
};

// ---------------------------------------------------------------------------------------------
// SHOOTER (POINTLESS VERSION)

var base_pointless_shooter = Object.create(base_shooter);
base_pointless_shooter.score = 0;

// ---------------------------------------------------------------------------------------------
// SHOOTER (SKULL VERSION)

var base_skull = Object.create(base_shooter);
base_skull.sprites = newimagearray(
    "res/skull1.png", "res/skull2.png", "res/skull3.png",
    "res/skull4.png", "res/skull5.png", "res/skull6.png",
    "res/skull5.png", "res/skull4.png", "res/skull3.png",
    "res/skull2.png"
);
base_skull.framerate = 15;

// ---------------------------------------------------------------------------------------------
// SHOOTER (YELLOW VERSION)

var base_shooter_yellow = Object.create(base_shooter);
base_shooter_yellow.sprites = newimagearray("res/shooter_shooter.png");

// ---------------------------------------------------------------------------------------------
// CHASER

var base_chaser = Object.create(base_entity);
base_chaser.sprites = newimagearray("res/chaser.png");
base_chaser.score = 100;

base_chaser.finished = false;

base_chaser.move = function () {

    if (sim.player.alive && this.finished === false) {
        var vector = this.unit_vector_to_player();
        this.speedx = vector[0] * 8;
        this.speedy = vector[1] * 8;
    } else {
        this.finished = true;
    }

    // Make sure that finished chasers eventually go out of bounds to get removed...

    if (this.finished && Math.abs(this.speedx) < 1 && Math.abs(this.speedy) < 1) {
        if (this.x > canvas.width / 2) {
            this.speedx = 1;
        } else {
            this.speedx = -1;
        }
    }

    this.x += this.speedx;
    this.y += this.speedy;
};

base_chaser.draw = function () {
    if (sim.player.alive && this.finished === false) {
        draw_line(this.x, this.y, sim.player.x, sim.player.y, "#ff0000");
    }
    base_entity.draw.apply(this);
};

// ---------------------------------------------------------------------------------------------
// BOULDER

var base_boulder = Object.create(base_shot);
base_boulder.sprites = newimagearray("res/ship2.png", "res/ship1.png");
base_boulder.scary = true;

base_boulder.lifespan = 500;
base_boulder.age = 0;

base_boulder.draw = function () {
    base_entity.draw.apply(this);
};

base_boulder.move = function () {
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

// ---------------------------------------------------------------------------------------------
// APPLE

var base_apple = Object.create(base_entity);
base_apple.sprites = newimagearray("res/apple.png");
base_apple.low_priority = true;

base_apple.harmless = true;

base_apple.lifespan = 500;
base_apple.age = 0;

base_apple.is_apple = true;

base_apple.move = base_boulder.move;

base_apple.damage = function () {

    // Damage from bees...

    base_entity.damage.apply(this);

    // Or from player...

    if (this.hp > 0) {
        if (this.collides_with_player()) {
            this.hp = 0;
        }
    }
};

// ---------------------------------------------------------------------------------------------
// CONSTRUCTORS (FIXME: most should take some parameters)

function new_stupid() {
    var e = Object.create(base_stupid);
    e.x = canvas.width + 32;
    e.y = Math.random() * canvas.height;
    e.speedx = Math.random() * -3 - 1;
    e.speedy = Math.random() * 4 - 2;
    return e;
}

function new_shooter() {
    var e = Object.create(base_shooter);
    e.x = canvas.width + 32;
    e.y = Math.random() * canvas.height;
    e.speedx = -3;
    return e;
}

function new_chaser() {
    var e = Object.create(base_chaser);
    if (sim.player.x > canvas.width / 2) {
        e.x = -32;
    } else {
        e.x = canvas.width + 32;
    }
    e.y = Math.random() * canvas.height;
    return e;
}

function set_for_border_spawn(e, o_min, o_max, t_max) {

    var r = Math.floor(Math.random() * 4);

    var speed_one = o_min + Math.random() * (o_max - o_min);        // Always positive, in range (o_min, o_max)
    var speed_two = Math.random() * t_max * 2 - t_max;              // Positive or negative, in range (-t_max, t_max)

    switch (r) {
    case 0:                                     // Left
        e.x = -32;
        e.y = Math.random() * canvas.height;
        e.speedx = speed_one;
        e.speedy = speed_two;
        break;
    case 1:                                     // Right
        e.x = canvas.width + 32;
        e.y = Math.random() * canvas.height;
        e.speedx = -speed_one;
        e.speedy = speed_two;
        break;
    case 2:                                     // Top
        e.x = Math.random() * canvas.width;
        e.y = -32;
        e.speedx = speed_two;
        e.speedy = speed_one;
        break;
    case 3:                                     // Bottom
        e.x = Math.random() * canvas.width;
        e.y = canvas.height + 32;
        e.speedx = speed_two;
        e.speedy = -speed_one;
        break;
    }
}

function new_boulder() {
    var e = Object.create(base_boulder);
    set_for_border_spawn(e, 4, 8, 2);
    return e;
}

function new_apple() {
    var e = Object.create(base_apple);
    set_for_border_spawn(e, 4, 4, 2);
    return e;
}
