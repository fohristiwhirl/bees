function randint(n) {
    "use strict";
    return Math.floor(Math.random() * n);
}

function newimage(src) {
    "use strict";
    var ret = new Image();
    ret.src = src;
    return ret;
}

function bees() {
    "use strict";

    var MARGIN_OF_ERROR = 2;
    var PLAYER_MAX_SPEED = 7.5;
    var BEECOUNT = 35;

    var canvas = document.getElementById("bees");
    var virtue = canvas.getContext("2d");
    var sim = {};


    // ---------------------------------------------------------------------------------------------
    // BEES

    var base_bee = {
        sim: sim,
        x: 0,
        y: 0,
        lastx: 0,
        lasty: 0,
        oldx: 0,
        oldy: 0,
        speedx: 0,
        speedy: 0,
        accel_mod: 0.57,
        max_speed: 9,
        colour: "#ffffff",
        target: null,
        avoidance: 3500
    };

    base_bee.move = function () {

        this.oldx = this.lastx;
        this.oldy = this.lasty;
        this.lastx = this.x;
        this.lasty = this.y;

        // Switch target...

        if (this.target === null || this.target === undefined) {
            this.target = this.sim.player;
        }

        var dx;
        var dy;
        if (this.target !== this.sim.player) {
            dx = Math.abs(this.target.x - this.x);
            dy = Math.abs(this.target.y - this.y);
            if (dx < 100 && dy < 100) {
                if (this.target !== this.sim.player) {
                    this.target = this.sim.player;
                }
            }
        }

        // Chase target...

        if (this.sim.player.alive || this.target !== this.sim.player) {

            var vector = this.unit_vector_to_target();
            var vecx = vector[0];
            var vecy = vector[1];

            if (vecx === 0 && vecy === 0) {
                this.speedx += Math.random() * this.accel_mod;
                this.speedy += Math.random() * this.accel_mod;
            } else {
                this.speedx += vecx * Math.random() * 2 * this.accel_mod / 2;
                this.speedy += vecy * Math.random() * 2 * this.accel_mod / 2;
            }

        } else {

            // We want to go to the player but the player is dead...

            this.speedx *= 2;
            this.speedy *= 2;
        }

        // Avoid scary entities...

        var n;
        var arr = this.sim.entities;
        var len = this.sim.entities.length;
        var enemy;
        var distance;
        var distance_squared;
        var adjusted_force;

        for (n = 0; n < len; n += 1) {

            enemy = arr[n];

            if (enemy.scary === false) {
                continue;
            }

            var dx = (enemy.x - this.x);
            var dy = (enemy.y - this.y);
            distance_squared = dx * dx + dy * dy;
            distance = Math.sqrt(distance_squared);
            if (distance > 0.01) {
                adjusted_force = this.avoidance / (distance_squared * distance);
                this.speedx -= dx * adjusted_force * Math.random();
                this.speedy -= dy * adjusted_force * Math.random();
            }
        }

        // Throttle speed...

        var speed = Math.sqrt(this.speedx * this.speedx + this.speedy * this.speedy);
        if (speed > this.max_speed) {
            this.speedx *= this.max_speed / speed;
            this.speedy *= this.max_speed / speed;
        }

        // Update position...

        this.x += this.speedx;
        this.y += this.speedy;
    };

    base_bee.unit_vector_to_target = function () {
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;

        if (dx < 0.01 && dx > -0.01 && dy < 0.01 && dy > -0.01) {
            return [0, 0];
        }

        var distance = Math.sqrt(dx * dx + dy * dy);
        return [dx / distance, dy / distance];
    };


    // ---------------------------------------------------------------------------------------------
    // BASE ENTITY

    var base_entity = {
        sim: sim,
        x: 0,
        y: 0,
        speedx: 0,
        speedy: 0,
        hp: 1,
        sprites: [],
        framerate: 60,
        scary: false,
        harmless: false,
        death_sound: "enemy_death",
        score: 0
    };

    base_entity.draw = function () {
        var sprite_index;
        var sprite;

        sprite_index = Math.floor(this.sim.iteration / this.framerate) % this.sprites.length;
        sprite = this.sprites[sprite_index];
        virtue.drawImage(sprite, this.x - sprite.width / 2, this.y - sprite.height / 2);
    };

    base_entity.move = function () {
        this.x += this.speedx;
        this.y += this.speedy;
    };

    base_entity.out_of_bounds = function () {
        if (this.x < -200 || this.x > this.sim.width + 200 || this.y < -200 || this.y > this.sim.height + 200) {
            return true;
        }
        return false;
    };

    base_entity.in_bounds = function () {
        if (this.x > 0 && this.x < this.sim.width && this.y > 0 && this.y < this.sim.height) {
            return true;
        }
        return false;
    };

    base_entity.damage = function () {
        var n;
        var arr = this.sim.bees;
        var len = this.sim.bees.length;
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
    };

    base_entity.unit_vector_to_player = function () {
        var dx = this.sim.player.x - this.x;
        var dy = this.sim.player.y - this.y;

        if (dx < 0.01 && dx > -0.01 && dy < 0.01 && dy > -0.01) {
            return [0, 0];
        }

        var distance = Math.sqrt(dx * dx + dy * dy);
        return [dx / distance, dy / distance];
    };


    // ---------------------------------------------------------------------------------------------
    // STUPID

    var base_stupid = Object.create(base_entity);
    base_stupid.sprites = [newimage("res/stupid.png")];

    base_stupid.score = 10;


    // ---------------------------------------------------------------------------------------------
    // SHOT

    var base_shot = Object.create(base_entity);
    base_shot.sprites = [newimage("res/shot.png")];

    base_shot.scary = true;

    base_shot.damage = function () {
        return;
    };


    // ---------------------------------------------------------------------------------------------
    // SHOOTER

    var base_shooter = Object.create(base_entity);
    base_shooter.sprites = [newimage("res/shooter.png")];

    base_shooter.score = 100;

    base_shooter.age = 0;

    base_shooter.move = function () {

        this.age += 1;

        var new_shot;
        var vector;

        if (this.age % 50 === 49 && this.sim.player.alive && this.in_bounds()) {

            new_shot = Object.create(base_shot);
            new_shot.x = this.x;
            new_shot.y = this.y;

            vector = this.unit_vector_to_player();
            new_shot.speedx = vector[0] * 5;
            new_shot.speedy = vector[1] * 5;

            this.sim.entities.push(new_shot);
        }

        base_entity.move.apply(this);        // For normal movement.
    };


    // ---------------------------------------------------------------------------------------------
    // CRACKED SHIP

    var base_cracked = Object.create(base_entity);
    base_cracked.harmless = true;
    base_cracked.death_sound = null;
    base_cracked.age = 0;

    base_cracked.damage = function () {
        this.age += 1;
        if (this.age > 60) {
            this.hp = 0;
        }
    };

    var base_cracked_left = Object.create(base_cracked);
    base_cracked_left.sprites = [newimage("res/cracked_left.png")];

    var base_cracked_right = Object.create(base_cracked);
    base_cracked_right.sprites = [newimage("res/cracked_right.png")];


    // ---------------------------------------------------------------------------------------------
    // SIM

    sim.width = window.innerWidth;
    sim.height = window.innerHeight;

    sim.iteration = 0;
    sim.score = 0;
    sim.bees = [];
    sim.entities = [];

    var bee;
    var r;
    var g;
    var b;

    while (sim.bees.length < BEECOUNT) {
        bee = Object.create(base_bee);
        bee.sim = sim;
        r = Math.floor(Math.random() * 127 + 128);
        g = Math.floor(Math.random() * 127 + 128);
        b = Math.floor(Math.random() * 127 + 128);
        bee.colour = "#" + r.toString(16) + g.toString(16) + b.toString(16);
        sim.bees.push(bee);
    }

    sim.reset_bees = function () {
        var n;
        var item;

        for (n = 0; n < this.bees.length; n += 1) {

            item = this.bees[n];

            if (item.x <= 0 || item.x >= this.width || item.y <= 0 || item.y >= this.height) {
                item.x = this.player.x;
                item.y = this.player.y;
                item.lastx = item.x;
                item.lasty = item.y;
                item.oldx = item.x;
                item.oldy = item.y;
                item.speedx = Math.random() * 10 - 5;
                item.speedy = Math.random() * 10 - 5;
            }
        }
    };


    // ---------------------------------------------------------------------------------------------
    // PLAYER

    sim.reset_player = function () {
        this.player.x = -120;
        this.player.y = this.height / 2;
        this.player.speedx = 4;
        this.player.speedy = 0;
        this.player.respawn_timer = 120;
        this.player.immune_timer = 120;
        this.player.alive = true;
    };

    sim.player = {
        sim: sim,
        max_speed: PLAYER_MAX_SPEED,
        sprites: [newimage("res/ship1.png"), newimage("res/ship2.png")],
        framerate: 60,
        keyboard: {"w": false, "a": false, "s": false, "d": false, " ": false}
    };

    sim.reset_player();
    sim.player.lives = 3;

    sim.reset_bees();

    sim.player.move = function () {

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

        if ((this.x < this.sprites[0].width && this.speedx < 0) || (this.x > this.sim.width - this.sprites[0].width && this.speedx > 0)) {
            this.speedx = 0;
        }
        if ((this.y < this.sprites[0].height && this.speedy < 0) || (this.y > this.sim.height - this.sprites[0].height && this.speedy > 0)) {
            this.speedy = 0;
        }

        this.x += this.speedx;
        this.y += this.speedy;
    };

    sim.player.damage = function () {

        var dx;
        var dy;
        var n;
        var arr = this.sim.entities;
        var len = this.sim.entities.length;
        var item;

        if (this.immune_timer > 0) {
            this.immune_timer -= 1;
            return;
        }

        for (n = 0; n < len; n += 1) {
            item = arr[n];
            if (item.harmless === false) {
                dx = Math.abs(item.x - this.x);
                dy = Math.abs(item.y - this.y);

                if (dx < this.sprites[0].width / 2 && dy < this.sprites[0].height / 2) {
                    this.alive = false;
                    this.lives -= 1;
                    this.crack();
                    item.hp = 0;
                    break;
                }
            }
        }
    };

    sim.player.crack = function () {
        var left = Object.create(base_cracked_left);
        left.x = this.x;
        left.y = this.y;
        left.speedx = this.speedx - 2;
        left.speedy = this.speedy;
        this.sim.entities.push(left);

        var right = Object.create(base_cracked_right);
        right.x = this.x;
        right.y = this.y;
        right.speedx = this.speedx + 2;
        right.speedy = this.speedy;
        this.sim.entities.push(right);
    };

    sim.target = sim.player;


    // ---------------------------------------------------------------------------------------------
    // GAME LOGIC

    sim.new_stupid = function () {
        var e;
        e = Object.create(base_stupid);
        e.x = this.width + 32;
        e.y = Math.random() * this.height;
        e.speedx = Math.random() * -3 - 1;
        e.speedy = Math.random() * 4 - 2;

        return e;
    };

    sim.new_shooter = function () {
        var e;
        e = Object.create(base_shooter);
        e.x = this.width + 32;
        e.y = Math.random() * this.height;
        e.speedx = -3;
        return e;
    };

    sim.enemy_gen = function () {
        var ret = [];
        var i = this.iteration;

        if (i % 100 === 99) {
            ret.push(this.new_stupid());
        }

        if (i % 450 === 449) {
            ret.push(this.new_shooter());
        }

        return ret;
    };

    sim.update = function () {

        var arr;
        var len;
        var item;
        var n;
        var oob;

        this.iteration += 1;

        // Add new enemies...

        this.entities.push.apply(this.entities, this.enemy_gen());    // Array concat in place.

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
                        this.play_sound(item.death_sound);
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
                    this.reset_player();
                    this.reset_bees();
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

        // Update title with score sometimes...

        if (this.iteration % 10 === 7) {
            document.title = "The Bees (score: " + this.score.toString() + ")";
        }

        // Adjust canvas size if needed...

        if (this.iteration % 60 === 0) {

            this.width = window.innerWidth;
            this.height = window.innerHeight;

            canvas.width = this.width;
            canvas.height = this.height;

        } else {

            virtue.clearRect(0, 0, this.width, this.height);

        }

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


    // ---------------------------------------------------------------------------------------------
    // DOCUMENT

    document.addEventListener("keydown", function (evt) {
        sim.player.keyboard[evt.key] = true;
    });

    document.addEventListener("keyup", function (evt) {
        sim.player.keyboard[evt.key] = false;
    });

    canvas.width = sim.width;
    canvas.height = sim.height;


    // ---------------------------------------------------------------------------------------------
    // SOUND - from Thomas Sturm: http://www.storiesinflight.com/html5/audio.html

    sim.audiochannels = [];
    while (sim.audiochannels.length < 8) {
        sim.audiochannels.push({channel: new Audio(), finished: -1});
    }

    sim.play_sound = function (s) {
        var a;
        var thistime = Date.now();

        for (a = 0; a < this.audiochannels.length; a += 1) {
            if (this.audiochannels[a].finished < thistime) {
                this.audiochannels[a].finished = thistime + document.getElementById(s).duration * 1000;
                this.audiochannels[a].channel.src = document.getElementById(s).src;
                this.audiochannels[a].channel.load();
                this.audiochannels[a].channel.play();
                break;
            }
        }
    };


    // ---------------------------------------------------------------------------------------------
    // DONE

    return sim;
}



bees().update();
