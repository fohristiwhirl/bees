"use strict";

function enemy_gen() {
    var ret = [];
    var i = sim.iteration;

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

    if (sim.level === 2) {
        if (i === 300) {
            ret.push(make_revolver());
            mixer.play("warning");
        }
    }

    return ret;
};
