"use strict";

function level_one() {
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

function level_two() {
    var i = sim.iteration;
    var ret = [];

    if (i === 300) {
        ret.push(make_revolver());
        mixer.play("warning");
    }

    if (i > 500 && sim.entities.length === 0) {
        sim.next_level();
    }

    return ret;
}

function level_three() {
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

function level_four() {
    var i = sim.iteration;
    var ret = [];

    if (i === 300) {
        ret.push(make_shooter_shooter());
        mixer.play("warning");
    }

    if (i > 500 && sim.entities.length === 0) {
        sim.next_level();
    }

    return ret;
}

function enemy_gen() {

    // Each level_x function is responsible for calling sim.next_level() when it's done.

    switch (sim.level) {
    case 1:
        return level_one();
        break;
    case 2:
        return level_two();
        break;
    case 3:
        return level_three();
        break;
    case 4:
        return level_four();
        break;
    default:
        return [];
        break;
    }
}
