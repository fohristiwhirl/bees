"use strict";

var levels = [];

levels[1] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i % 100 === 99) {
        ret.push(new_stupid());
    }
    if (i % 450 === 449) {
        ret.push(new_shooter());
    }

    if (i === 1500) {
        sim.next_level();
    }

    return ret;
}

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
}

levels[3] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i > 2000) {
        if (sim.entities.length === 0) {
            sim.next_level();
        }
    } else {
        if (i % 100 === 99) {
            ret.push(new_chaser());
        }
        if (i % 350 === 349) {
            ret.push(new_shooter());
        }
    }

    return ret;
}

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
}

levels[5] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i > 2000) {
        if (sim.entities.length === 0) {
            sim.next_level();
        }
    } else {
        if (i % 40 === 39) {
            ret.push(new_boulder());
        }
    }

    return ret;
}

levels[6] = function () {
    var i = sim.iteration;
    var ret = [];

    if (i % 100 === 99) {
        ret.push(new_apple());
    }
    if (i === 300) {
        ret.push(make_snake());
        mixer("warning");
    }

    if (i > 500 && sim.boss_present() === false) {
        sim.next_level();
    }

    return ret;
}

function enemy_gen() {
    if (levels[sim.level] !== undefined) {
        return levels[sim.level]();
    } else {
        return [];
    }
}
