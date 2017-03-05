"use strict";

function enemy_gen(i) {
    var ret = [];

    if (i % 100 === 99) {
        ret.push(new_stupid());
    }

    if (i % 450 === 449) {
        ret.push(new_shooter());
    }

    return ret;
};
