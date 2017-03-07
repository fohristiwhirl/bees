"use strict";

function enemy_gen() {
    var ret = [];
    var i = sim.iteration;

    // LEVEL 1

    if (sim.level === 1) {

        if (i % 100 === 99) {
            ret.push(new_stupid());
        }
        if (i % 450 === 449) {
            ret.push(new_shooter());
        }
        if (i === 1500) {
            sim.next_level();
        }
    }

    // LEVEL 2

    if (sim.level === 2) {

        if (i === 300) {
            ret.push(make_revolver());
            mixer.play("warning");
        }

        if (i > 500 && sim.entities.length === 0) {
            sim.next_level();
        }
    }

    // LEVEL 3

    if (sim.level === 3) {

        if (i % 100 === 99) {
            ret.push(new_chaser());
        }
        if (i % 350 === 349) {
            ret.push(new_shooter());
        }
        if (i === 2500) {
            sim.next_level();
        }
    }

    return ret;
}
