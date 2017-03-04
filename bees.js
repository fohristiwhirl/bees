function randint(n) {
    "use strict";
    return Math.floor(Math.random() * n);
}

function bees() {
    "use strict";

    var MARGIN_OF_ERROR = 2;
    var PLAYER_MAX_SPEED = 10;
    var BEECOUNT = 35;

    var canvas = document.getElementById("bees");
    var virtue = canvas.getContext("2d");
    var sim = {};

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
        avoidance: 4200
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
            dx = this.target.x - this.x;
            dy = this.target.y - this.y;
            if (dx < 0) {
                dx *= -1;
            }
            if (dy < 0) {
                dy *= -1;
            }
            if (dx < 100 && dy < 100) {
                if (this.target !== this.sim.player) {
                    this.target = this.sim.player;
                }
            }
        }

        // Chase target...

        var vector = this.unit_vector_to_target();
        var vecx = vector[0];
        var vecy = vector[1];

        if (vecx === 0 && vecy === 0) {
            this.speedx += (Math.random() * 2 - 1) * this.accel_mod;
            this.speedy += (Math.random() * 2 - 1) * this.accel_mod;
        } else {
            this.speedx += vecx * Math.random() * this.accel_mod;
            this.speedy += vecy * Math.random() * this.accel_mod;
        }
/*
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

            var dx = (enemy.x - this.x) * 0.75;       // Reduce the distance, to strengthen the effect
            var dy = (enemy.y - this.y) * 0.75;
            distance_squared = dx * dx + dy * dy;
            distance = Math.sqrt(distance_squared);
            if (distance > 0.01) {
                adjusted_force = this.avoidance / (distance_squared * distance);
                this.speedx -= dx * adjusted_force * Math.random();
                this.speedy -= dy * adjusted_force * Math.random();
            }
        }
*/
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

    // Entities...

    var base_enemy = {
        sim: sim, x: 0, y: 0, speedx: 0, speedy: 0, hp: 1, sprites: [], framerate: 60, scary: false, harmless: false, death_sound: "enemy_death"
    };

    base_enemy.move = function () {
        this.x += this.speedx;
        this.y += this.speedy;
    };

    base_enemy.out_of_bounds = function () {
        if (this.x < -200 || this.x > this.sim.width + 200 || this.y < -200 || this.y > this.sim.height + 200) {
            return true;
        }
        return false;
    };

    base_enemy.damage = function () {
        var n;
        var arr = this.sim.bees;
        var len = this.sim.bees.length;
        var bee;
        var dx;
        var dy;

        for (n = 0; n < len; n += 1) {
            bee = arr[n];
            dx = bee.x - this.x;
            if (dx < 0) {
                dx *= -1;
            }
            if (dx < this.sprites[0].width / 2 + MARGIN_OF_ERROR) {
                dy = bee.y - this.y;
                if (dy < 0) {
                    dy *= -1;
                }
                if (dy < this.sprites[0].height / 2 + MARGIN_OF_ERROR) {
                    this.hp -= 1;
                }
            }
        }
    };

    base_enemy.unit_vector_to_player = function () {
        var dx = this.sim.player.x - this.x;
        var dy = this.sim.player.y - this.y;

        if (dx < 0.01 && dx > -0.01 && dy < 0.01 && dy > -0.01) {
            return [0, 0];
        }

        var distance = Math.sqrt(dx * dx + dy * dy);
        return [dx / distance, dy / distance];
    };

    // STUPID

    var base_stupid = Object.create(base_enemy);
    base_stupid.sprites = [new Image()];
    base_stupid.sprites[0].src = "res/stupid.png";

    // SHOT

    var base_shot = Object.create(base_enemy);
    base_shot.sprites = [new Image()];
    base_shot.sprites[0].src = "res/shot.png";

    base_shot.scary = true;

    base_shot.damage = function () {};

    // SHOOTER

    var base_shooter = Object.create(base_enemy);
    base_shooter.sprites = [new Image()];
    base_shooter.sprites[0].src = "res/shooter.png";

    base_shooter.age = 0;

    base_shooter.move = function () {

        this.age += 1;

        var new_shot;
        var vector;
        var vecx;
        var vecy;

        if (this.age % 50 == 49) {

            new_shot = Object.create(base_shot);
            new_shot.x = this.x;
            new_shot.y = this.y;

            vector = this.unit_vector_to_player();
            new_shot.speedx = vector[0] * 5;
            new_shot.speedy = vector[1] * 5;

            this.sim.entities.push(new_shot);
        }

        base_enemy.move.apply(this);        // For normal movement.
    }

    // Set up sim...

    sim.width = window.innerWidth;
    sim.height = window.innerHeight;

    sim.iteration = 0;
    sim.bees = [];
    sim.entities = [];

    var bee;
    var r;
    var g;
    var b;

    while (sim.bees.length < BEECOUNT) {
        bee = Object.create(base_bee);
        bee.sim = sim,
        bee.x = sim.width / 2;
        bee.y = sim.height / 2;
        bee.lastx = bee.x;
        bee.lasty = bee.y;
        bee.oldx = bee.x;
        bee.oldy = bee.y;
        bee.speedx = Math.random() * 10 - 5;
        bee.speedy = Math.random() * 10 - 5;
        r = Math.floor(Math.random() * 127 + 128);
        g = Math.floor(Math.random() * 127 + 128);
        b = Math.floor(Math.random() * 127 + 128);
        bee.colour = "#" + r.toString(16) + g.toString(16) + b.toString(16);
        sim.bees.push(bee);
    }

    // Set up player...

    var shipsprite1 = new Image();
    var shipsprite2 = new Image();
    shipsprite1.src = "res/ship.png";
    shipsprite2.src = "res/ship2.png";

    sim.player = {
        sim: sim,
        x: sim.width / 2,
        y: sim.height / 2,
        speedx: 0,
        speedy: 0,
        max_speed: PLAYER_MAX_SPEED,
        sprites: [shipsprite1, shipsprite2],
        framerate: 60,
        alive: true,
        keyboard: {"w": false, "a": false, "s": false, "d": false, " ": false}
    };

    sim.player.move = function () {
        if (this.keyboard.w) {
            this.speedy -= 0.4;
        }
        if (this.keyboard.a) {
            this.speedx -= 0.4;
        }
        if (this.keyboard.s) {
            this.speedy += 0.4;
        }
        if (this.keyboard.d) {
            this.speedx += 0.4;
        }
        if (this.keyboard[" "]) {
            this.speedx *= 0.95;
            if (this.speedx < 0.05 && this.speedx > -0.05) {
                this.speedx = 0;
            }
            this.speedy *= 0.95;
            if (this.speedy < 0.05 && this.speedy > -0.05) {
                this.speedy = 0;
            }
        }

        var speed = Math.sqrt(this.speedx * this.speedx + this.speedy * this.speedy);

        if (speed > this.max_speed) {
            this.speedx *= this.max_speed / speed;
            this.speedy *= this.max_speed / speed;
        }

        if ((this.x < this.sprites[0].width && this.speedx < 0) || (this.x > this.sim.width - this.sprites[0].width && this.speedx > 0)) {
            this.speedx *= -1;
        }
        if ((this.y < this.sprites[0].height && this.speedy < 0) || (this.y > this.sim.height - this.sprites[0].height && this.speedy > 0)) {
            this.speedy *= -1;
        }

        this.x += this.speedx;
        this.y += this.speedy;
    };

    sim.target = sim.player;

    // Main logic functions...

    sim.enemy_gen = function () {
        var ret = [];
        var i = this.iteration;
        var e;

        if (i % 100 === 99) {
            e = Object.create(base_stupid);
            e.x = this.width + 32;
            e.y = Math.random() * this.height;
            e.speedx = -3;

            ret.push(e);
        }

        if (i % 450 === 449) {
            e = Object.create(base_shooter);
            e.x = this.width + 32;
            e.y = Math.random() * this.height;
            e.speedx = -3;

            ret.push(e);
        }

        return ret;
    };
/*
    sim.mouse = function (evt) {

        var new_target = {};
        new_target.x = evt.clientX - canvas.offsetLeft;
        new_target.y = evt.clientY - canvas.offsetTop;

        var arr = this.bees;
        var len = this.bees.length;
        var n;
        for (n = 0; n < len; n += 1) {
            this.bees[n].target = new_target;
        }
    };
*/
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
                    this.play_sound(item.death_sound);
                }
            }
        }

        // Move bees...

        arr = this.bees;
        len = this.bees.length;
        for (n = 0; n < len; n += 1) {
            arr[n].move();
        }

        // Move player...

        if (this.player.alive) {
            this.player.move();
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
            item = arr[n];
            sprite_index = Math.floor(this.iteration / item.framerate) % item.sprites.length;
            sprite = item.sprites[sprite_index];
            virtue.drawImage(sprite, item.x - sprite.width / 2, item.y - sprite.height / 2);
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

    // Set up the document...

    document.addEventListener("keydown", function (evt) {
        sim.player.keyboard[evt.key] = true;
    });

    document.addEventListener("keyup", function (evt) {
        sim.player.keyboard[evt.key] = false;
    });

    canvas.width = sim.width;
    canvas.height = sim.height;
/*
    canvas.addEventListener("mousedown", function (evt) {
        sim.mouse(evt);
    });
*/
    // Sound from Thomas Sturm: http://www.storiesinflight.com/html5/audio.html

    sim.audiochannels = [];
    while (sim.audiochannels.length < 8) {
        sim.audiochannels.push({channel: new Audio(), finished: -1});
    }

    sim.play_sound = function (s) {
        var a;
        var thistime = (new Date()).getTime();

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

    // Everything is set...

    return sim;
}

bees().update();
