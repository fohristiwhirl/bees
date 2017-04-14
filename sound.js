"use strict";

var sounds = {};

sounds.click = new Audio("res/click.mp3")
sounds.enemy_death = new Audio("res/enemy_death.mp3")
sounds.warning = new Audio("res/warning.mp3")

// ---------------------------------------------------------------------------------------------
// Mixer based on ideas by Thomas Sturm: http://www.storiesinflight.com/html5/audio.html

function make_mixer() {
    var audiochannels = [];
    while (audiochannels.length < 8) {
        audiochannels.push({channel: new Audio(), finished: -1});
    }

    return function (s) {       // For historical reasons, s is a string specifying the key in the sounds object

        var sound = sounds[s]

        if (sound === undefined) {
            return;
        }

        var a;
        var thistime = Date.now();

        for (a = 0; a < audiochannels.length; a += 1) {
            if (audiochannels[a].finished < thistime) {
                audiochannels[a].finished = thistime + sound.duration * 1000;
                audiochannels[a].channel.src = sound.src;
                audiochannels[a].channel.load();
                audiochannels[a].channel.play();
                break;
            }
        }
    };
}

var mixer = make_mixer();
