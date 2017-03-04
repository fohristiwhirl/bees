function randint(n) {
    "use strict";
    return Math.floor(Math.random() * n);
}

function bees() {
    "use strict";

    var shipsprite = new Image();
    shipsprite.src = "res/ship.png";

    var PLAYER_MAX_SPEED = 10;
    var BUGCOUNT = 20;

    var canvas = document.getElementById("bees");
    var virtue = canvas.getContext("2d");
    var sim;

    var base_bug = {x: 0, y: 0, lastx: 0, lasty: 0, oldx: 0, oldy: 0, speedx: 0, speedy: 0, accel_mod: 0.77, max_speed: 9, colour: "#ffffff"};

    base_bug.move = function () {

        this.oldx = this.lastx;
        this.oldy = this.lasty;
        this.lastx = this.x;
        this.lasty = this.y;

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

    base_bug.unit_vector_to_target = function () {
        var dx = sim.target.x - this.x;
        var dy = sim.target.y - this.y;

        if (dx < 0.01 && dx > -0.01 && dy < 0.01 && dy > -0.01) {
            return [0, 0];
        }

        var distance = Math.sqrt(dx * dx + dy * dy);
        return [dx / distance, dy / distance];
    };

    // Enemies...

    var base_enemy = {x: 0, y: 0, speedx: 0, speedy: 0, hp: 1, sprite: null};

    base_enemy.move = function () {
        this.x += this.speedx;
        this.y += this.speedy;
    };

    base_enemy.out_of_bounds = function () {
        if (this.x < -200 || this.x > sim.width + 200 || this.y < -200 || this.y > sim.height + 200) {
            return true;
        }
        return false;
    };

    base_enemy.damage = function () {
        var n;
        var arr = sim.bugs;
        var len = sim.bugs.length;
        var bug;
        var dx;
        var dy;

        for (n = 0; n < len; n += 1) {
            bug = arr[n];
            dx = bug.x - this.x;
            if (dx < this.sprite.width / 2 && dx > -this.sprite.height / 2) {
                dy = bug.y - this.y;
                if (dy < this.sprite.height / 2 && dy > -this.sprite.height / 2) {
                    this.hp -= 1;
                }
            }
        }
    };

    // STUPID

    var base_stupid = Object.create(base_enemy);
    base_stupid.sprite = new Image();
    base_stupid.sprite.src = "res/stupid.png";

    // Set up sim...

    sim = Object.create(null);

    sim.width = window.innerWidth;
    sim.height = window.innerHeight;

    sim.iteration = 0;
    sim.bugs = [];
    sim.enemies = [];

    var bug;
    var r;
    var g;
    var b;

    while (sim.bugs.length < BUGCOUNT) {
        bug = Object.create(base_bug);
        bug.x = sim.width / 2;
        bug.y = sim.height / 2;
        bug.lastx = sim.width / 2;
        bug.lasty = sim.height / 2;
        bug.oldx = sim.width / 2;
        bug.oldy = sim.height / 2;
        bug.speedx = Math.random() * 10 - 5;
        bug.speedy = Math.random() * 10 - 5;
        r = Math.floor(Math.random() * 127 + 128);
        g = Math.floor(Math.random() * 127 + 128);
        b = Math.floor(Math.random() * 127 + 128);
        bug.colour = "#" + r.toString(16) + g.toString(16) + b.toString(16);
        sim.bugs.push(bug);
    }

    // Set up player...

    sim.player = {
        x: sim.width / 2,
        y: sim.height / 2,
        speedx: 0,
        speedy: 0,
        max_speed: PLAYER_MAX_SPEED,
        sprite: shipsprite,
        keyboard: {"w": false, "a": false, "s": false, "d": false, " ": false}
    };

    sim.player.move = function () {
        if (this.keyboard.w) {
            this.speedy -= 0.2;
        }
        if (this.keyboard.a) {
            this.speedx -= 0.2;
        }
        if (this.keyboard.s) {
            this.speedy += 0.2;
        }
        if (this.keyboard.d) {
            this.speedx += 0.2;
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

        if ((this.x < 16 && this.speedx < 0) || (this.x > sim.width - 16 && this.speedx > 0)) {
            this.speedx *= -1;
        }
        if ((this.y < 16 && this.speedy < 0) || (this.y > sim.height - 16 && this.speedy > 0)) {
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
            e.x = sim.width + 32;
            e.y = Math.random() * sim.height;
            e.speedx = -3;

            ret.push(e);
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

        this.enemies.push.apply(this.enemies, this.enemy_gen());    // Array concat in place.

        arr = this.enemies;
        len = this.enemies.length;
        for (n = len - 1; n >= 0; n -= 1) {
            item = arr[n];
            item.move();
            item.damage();

            oob = item.out_of_bounds();

            if (item.hp <= 0 || oob) {
                arr.splice(n, 1);   // Deletes from array in place; the reference arr thus works.
                if (oob === false) {
                    this.play_sound(enemy_death_sound);
                }
            }
        }

        arr = this.bugs;
        len = this.bugs.length;
        for (n = 0; n < len; n += 1) {
            arr[n].move();
        }

        this.player.move();

        var that = this;
        requestAnimationFrame(function () {
            that.frame();
        });
    };

    sim.frame = function () {

        if (this.iteration % 60 === 0) {

            this.width = window.innerWidth;
            this.height = window.innerHeight;

            canvas.width = this.width;
            canvas.height = this.height;

        } else {

            virtue.clearRect(0, 0, this.width, this.height);

        }

        var arr;
        var len;
        var item;
        var n;

        virtue.lineWidth = 3;

        arr = this.bugs;
        len = this.bugs.length;
        for (n = 0; n < len; n += 1) {
            item = arr[n];
            virtue.strokeStyle = item.colour;
            virtue.beginPath();
            virtue.moveTo(item.oldx, item.oldy);
            virtue.lineTo(item.x, item.y);
            virtue.stroke();
        }

        arr = this.enemies;
        len = this.enemies.length;
        for (n = 0; n < len; n += 1) {
            item = arr[n];
            virtue.drawImage(item.sprite, item.x - item.sprite.width / 2, item.y - item.sprite.height / 2);
        }

        virtue.drawImage(this.player.sprite, this.player.x - shipsprite.width / 2, this.player.y - shipsprite.height / 2);

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

    // Sound from Thomas Sturm: http://www.storiesinflight.com/html5/audio.html

    var enemy_death_sound = new Audio("res/enemy_death.wav");

    sim.audiochannels = [];
    while (sim.audiochannels.length < 8) {
        sim.audiochannels.push({channel: new Audio(), finished: -1});
    }

    sim.play_sound = function (s) {
        var a;
        var thistime = (new Date()).getTime();

        for (a = 0; a < sim.audiochannels.length; a += 1) {
            if (sim.audiochannels[a].finished < thistime) {
                sim.audiochannels[a].finished = thistime + s.duration * 1000;
                sim.audiochannels[a].channel.src = s.src;
                sim.audiochannels[a].channel.load();
                sim.audiochannels[a].channel.play();
                break;
            }
        }
    };

    // Everything is set...

    return sim;
}

bees().update();
