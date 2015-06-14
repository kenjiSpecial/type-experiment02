var letterCanvasRenderer = require('./letter-canvas-renderer').letterCanvasRenderer;

function getDistance(pt1, pt2){
    var dx = pt1.x - pt2.x;
    var dy = pt1.y - pt2.y;

    var dis = Math.sqrt( dx * dx + dy * dy );

    return dis;
}

module.exports.pointToPixel = function(fontSize, dpi){
    dpi = dpi || dpi === 0 ? dpi : 96;
    fontSize = fontSize * dpi / 72;
    return Math.round(fontSize);
};


module.exports.getPxScale = function(font, fontSize) {
    if(font.bitmap)
        return 1.0;

    fontSize = typeof fontSize === "number" ? fontSize : this.pointToPixel(font.size);

    var sz = font.units_per_EM/64;
    sz = (sz/font.size * fontSize);

    //var val = ( 1 / 64/ font.size * fontSize ) ;

    return ((font.resolution * 1/72 * sz) / font.units_per_EM);
};


module.exports.getDistance = getDistance;

module.exports.calculateDistance = function( pathData ){
    var prevX, prevY;
    var pprevX, pprevY;
    var ii;
    var xPos, yPos;
    var rate0, rate1;
    var maxVal = 10;

    var totalDistance = 0;

    pathData.forEach(function(data){
        var letterType = data[0];

        switch (letterType){
            case "m":
                prevX = pprevX = data[1];
                prevY = pprevY = data[2];
                break;
            case "q":

                for (ii = 0; ii <= maxVal; ii++) {
                    rate0 = ii / maxVal;
                    rate1 = 1.0 - rate0;

                    xPos = rate1 * rate1 * prevX + 2 * rate0 * rate1 * data[1] + rate0 * rate0 * data[3];
                    yPos = rate1 * rate1 * prevY + 2 * rate0 * rate1 * data[2] + rate0 * rate0 * data[4];

                    var distance = getDistance({x: pprevX, y: pprevY}, {x: xPos, y: yPos});

                    pprevX = xPos;
                    pprevY = yPos;

                    totalDistance += distance;
                }

                prevX = pprevX = data[3];
                prevY = pprevY = data[4];
                break;
            case "c":

                for (ii = 0; ii <= maxVal; ii++) {
                    rate0 = ii / maxVal;
                    rate1 = 1.0 - rate0;

                    xPos = rate1 * rate1 * rate1 * prevX + 3 * rate0 * rate1 * rate1 * data[1] + 3 * rate0 * rate0 * rate1 * data[3] + rate0 * rate0 * rate0 * data[5];
                    yPos = rate1 * rate1 * rate1 * prevY + 3 * rate0 * rate1 * rate1 * data[2] + 3 * rate0 * rate0 * rate1 * data[4] + rate0 * rate0 * rate0 * data[6];
                    var distance = getDistance({x: pprevX, y: pprevY}, {x: xPos, y: yPos});

                    pprevX = xPos;
                    pprevY = yPos;

                    totalDistance += distance;
                }

                prevX = pprevX = data[5];
                prevY = pprevY = data[6];
                break;
            case "l":

                var distance = getDistance({x: prevX, y: prevY}, {x: data[1], y: data[2]});

                totalDistance += distance;

                prevX = pprevX = data[1];
                prevY = pprevY = data[2];
                break;

        }

    });

    return totalDistance;

};

module.exports.letterCanvasRenderer = function(ctx, fontPath){
    ctx.fillStyle = "#00BCD4";
    letterCanvasRenderer(ctx, fontPath);
    ctx.fill();
};


