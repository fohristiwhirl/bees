function draw_boss_hitpoints(fraction) {
    var x1;
    var y1;
    var w;
    var h;

    // Outline...

    x1 = canvas.width / 4;
    y1 = 10;
    w = canvas.width / 2;
    h = 10;

    virtue.strokeStyle = "#ff0000";
    virtue.rect(x1,y1,w,h);
    virtue.stroke();

    // Filled rect...

    virtue.beginPath();
    virtue.rect(x1, y1, w * fraction, h);
    virtue.fillStyle = "#ff0000";
    virtue.fill();
}
