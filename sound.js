"use strict";

var sounds = {};

sounds.click = new Audio("res/click.mp3")
sounds.enemy_death = new Audio("res/enemy_death.mp3")
sounds.warning = new Audio("res/warning.mp3")

// ---------------------------------------------------------------------------------------------
// Mixer based on ideas by Thomas Sturm: http://www.storiesinflight.com/html5/audio.html
// Seems to have some issues in IE, not sure why.

function make_mixer() {
    var finishtimes = [];
    while (finishtimes.length < 8) {
        finishtimes.push(-1);
    }

    return function (s) {       // For historical reasons, s is a string specifying the key in the sounds object

        var sound = sounds[s];
        var newsound;

        if (sound === undefined) {
            return;
        }

        var a;
        var thistime = Date.now();

        for (a = 0; a < finishtimes.length; a += 1) {
            if (finishtimes[a] < thistime) {
                finishtimes[a] = thistime + sound.duration * 1000;
                newsound = sound.cloneNode();
                newsound.play();
                break;
            }
        }
    };
}

var mixer = make_mixer();
