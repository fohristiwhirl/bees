"use strict";

// ---------------------------------------------------------------------------------------------
// SOUND - from Thomas Sturm: http://www.storiesinflight.com/html5/audio.html

function make_mixer() {
    var audiochannels = [];
    while (audiochannels.length < 8) {
        audiochannels.push({channel: new Audio(), finished: -1});
    }

    return function (s) {
        var a;
        var thistime = Date.now();

        for (a = 0; a < audiochannels.length; a += 1) {
            if (audiochannels[a].finished < thistime) {
                audiochannels[a].finished = thistime + document.getElementById(s).duration * 1000;
                audiochannels[a].channel.src = document.getElementById(s).src;
                audiochannels[a].channel.load();
                audiochannels[a].channel.play();
                break;
            }
        }
    };
}
var mixer = make_mixer();
