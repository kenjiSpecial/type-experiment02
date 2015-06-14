
module.exports.letterCanvasRenderer = function( ctx, glyph ) {

    ctx.beginPath();

    glyph.forEach(function(elem){
        var letterType = elem[0];

        switch(letterType){
            case "m":
                ctx.moveTo(elem[1], elem[2]);
                break;
            case "q":
                ctx.quadraticCurveTo(elem[1], elem[2], elem[3], elem[4]);
                break;
            case "c":
                ctx.bezierCurveTo( elem[1], elem[2], elem[3], elem[4], elem[5], elem[6] );
                break;
            case "l":
                ctx.lineTo(elem[1], elem[2]);
                break;
        }

    });

    ctx.closePath();

};
