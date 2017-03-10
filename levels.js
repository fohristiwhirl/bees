"use strict";

var levels = [];

// Construct a params object to spawn at a random border, with speed as requested...

function border_params(o_min, o_max, t_max) {

    var e = {};

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

    return e;
}

function away_from_player_params() {
    var e = {};
    if (sim.player.x > canvas.width / 2) {
        e.x = -32;
    } else {
        e.x = canvas.width + 32;
    }
    e.y = Math.random() * canvas.height;
    return e;
}

// Levels...

function enemy_gen() {
    if (levels[sim.level] !== undefined) {
        return levels[sim.level]();             // Note that this is a call.
    } else {
        return [];
    }
}

levels[1] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i % 100 === 99) {
        ret.push(new_stupid({x: canvas.width + 32, y: Math.random() * canvas.height, speedx: Math.random() * -3 - 1, speedy: Math.random() * 4 - 2}));
    }
    if (i % 450 === 449) {
        ret.push(new_shooter({x: canvas.width + 32, y: Math.random() * canvas.height, speedx: -3, speedy: 0}));
    }

    if (i === 1500) {
        sim.next_level();
    }

    return ret;
};

levels[2] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i === 300) {
        ret.push(make_revolver());
        mixer("warning");
    }

    if (i > 500 && sim.entities.length === 0) {
        sim.next_level();
    }

    return ret;
};

levels[3] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i > 2000) {
        if (sim.entities.length === 0) {
            sim.next_level();
        }
    } else {
        if (i % 100 === 99) {
            ret.push(new_chaser(away_from_player_params()));
        }
        if (i % 350 === 349) {
            ret.push(new_shooter({x: canvas.width + 32, y: Math.random() * canvas.height, speedx: -3, speedy: 0}));
        }
    }

    return ret;
};

levels[4] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i === 100) {
        ret.push(make_shooter_shooter());
        mixer("warning");
    }

    if (i > 300 && sim.entities.length === 0) {
        sim.next_level();
    }

    return ret;
};

levels[5] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i > 2000) {
        if (sim.entities.length === 0) {
            sim.next_level();
        }
    } else {
        if (i % 40 === 39) {
            ret.push(new_boulder(border_params(4, 8, 2)));
        }
    }

    return ret;
};

levels[6] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i % 100 === 99) {
        ret.push(new_apple(border_params(4, 4, 2)));
    }
    if (i === 300) {
        ret.push(make_snake());
        mixer("warning");
    }

    if (i > 500 && sim.boss_present() === false) {
        sim.next_level();
    }

    return ret;
};
