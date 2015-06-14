require('./utils');
var AppAction = require('../../../actions/app-action');
var devicePixelRatio = window.devicePixelRatio || 1;

var fontUtil = require('./fontpath-util');
var FontpathGlyphIterator = require('./fontpath-glyph-iterator');
var letterCanvasRenderer = require('./fontpath-util').letterCanvasRenderer;

class TypeRenderer{
    constructor( Font, fontSize ){

        this.glyphIterator = new FontpathGlyphIterator( Font, fontSize);
        this.characterArr = [];

        this.margin = 30;

        this.createFontTable();
        this.createLayout();
    }


    createFontTable(){

        for(var type in this.glyphIterator.font.glyphs){


            var glyphData = this.glyphIterator.font.glyphs[type];
            var scale = this.glyphIterator.fontScale;
            var fontHeight = glyphData.height * scale;
            var fontHby = glyphData.hby * scale;
            var fontWidth = glyphData.width * scale;
            var fontSize = this.glyphIterator.fontSize;


            var glyphPath = glyphData.path.map(function(element){

                var elementArr = [];
                elementArr.push(element[0]);
                for(var ii = 1; ii < element.length; ii++){
                    if(ii % 2 == 1){
                        elementArr.push( element[ii] * scale );
                    }else{
                        elementArr.push(  fontSize - element[ii] * scale );
                    }
                }

                return elementArr;
            });

            var canvas = document.createElement("canvas");
            canvas.width  = this.glyphIterator.fontSize * devicePixelRatio;
            canvas.height = this.glyphIterator.fontSize * devicePixelRatio;
            var ctx = canvas.getContext("2d");
            ctx.scale( devicePixelRatio, devicePixelRatio );

            var posX = (fontSize - fontWidth)/2;
            var posY = -fontSize + (fontHby ) + (fontSize - fontHeight)/2;  //(fontSize - fontHeight)/2;


            ctx.fillRect( 0, 0, this.glyphIterator.fontSize, this.glyphIterator.fontSize);

            ctx.save();
            ctx.translate( posX, posY );
            letterCanvasRenderer(ctx, glyphPath);
            ctx.restore();



            var typeLength = fontUtil.calculateDistance(glyphPath);

            if(typeLength > 0) {
                this.characterArr.push({
                    letter: type,
                    path: glyphPath,
                    height: fontHeight,
                    width: fontWidth,
                    length: typeLength,
                    canvas : canvas
                });
            }
        }
    }

    createLayout(){

        var fontSize = this.glyphIterator.fontSize;
        var count = 0;
        var width = fontSize;

        while(width < window.innerWidth){
            width += fontSize + this.margin;
            count++;
        }

        width -= (fontSize + this.margin);
        this.layoutWidth = width;
        this.layoutLeft  = (window.innerWidth - width)/2;
        this.layoutTop = 60;

        this.marginVertical = 60;


        this.columnCount = count;
        this.rowCount = parseInt(this.characterArr.length / count)+ 1;
        this.layoutHeight = this.rowCount * fontSize + (this.rowCount - 1) * this.marginVertical;


        //this.containerWidth

        AppAction.createLayout(this.layoutHeight + this.layoutTop * 2);

    }

    render(ctx){
        var posX = 0; var posY = 0;
        var fontSize = this.glyphIterator.fontSize;

        ctx.save();
        ctx.translate(this.layoutLeft, this.layoutTop);

        this.characterArr.forEach(function(elem, index){
            var xPos = (index % this.columnCount) * (fontSize + this.margin);
            var yPos = parseInt(index / this.columnCount) * (fontSize + this.marginVertical);


            var fontLength = parseInt(elem.length);
            ctx.drawImage( elem.canvas, xPos, yPos );
            ctx.font = `400 20px "Roboto"`;
            ctx.fillStyle = "#000";
            var textWidth = ctx.measureText(fontLength).width;
            ctx.fillText( fontLength, xPos + (fontSize - textWidth)/2, yPos + fontSize + 24 );
        }.bind(this));

        ctx.restore();

    }


}

module.exports = TypeRenderer;
