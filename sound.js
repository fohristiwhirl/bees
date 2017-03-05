"use strict";

// ---------------------------------------------------------------------------------------------
// SOUND - from Thomas Sturm: http://www.storiesinflight.com/html5/audio.html

function make_mixer() {

    var new_mixer = {};

    new_mixer.audiochannels = [];
    while (new_mixer.audiochannels.length < 8) {
        new_mixer.audiochannels.push({channel: new Audio(), finished: -1});
    }

    new_mixer.play_sound = function (s) {
        var a;
        var thistime = Date.now();

        for (a = 0; a < new_mixer.audiochannels.length; a += 1) {
            if (new_mixer.audiochannels[a].finished < thistime) {
                new_mixer.audiochannels[a].finished = thistime + document.getElementById(s).duration * 1000;
                new_mixer.audiochannels[a].channel.src = document.getElementById(s).src;
                new_mixer.audiochannels[a].channel.load();
                new_mixer.audiochannels[a].channel.play();
                break;
            }
        }
    };

    return new_mixer;
}


var mixer = make_mixer();
