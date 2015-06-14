require('./utils');
var util = require('./fontpath-util');
var letterCanvasRenderer = require('./letter-canvas-renderer').letterCanvasRenderer;
var FontpathGlyphIterator = require('./fontpath-glyph-iterator');
var getDistance = require('./fontpath-util').getDistance;

class FontpathRenderer {
    constructor(text, Font, fontSize = 18) {
        if (!Font) {
            alert("Font doesn't be selected.")
            return;
        }

        this.font = Font;
        this.fontSize = fontSize;

        this.glyphIterator = new FontpathGlyphIterator(this.font, this.fontSize);

        this.x = 0;
        this.y = 0;

        this.text = text;
    }

    // ------------------

    get text() {
        return this._text;
    }

    set text(value) {
        this._text = value;
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        this.fontScale = util.getPxScale(this.font, value);
        this._fontSize = value;
    }

    //getLineGap(){}

    // ------------------

    renderLetterOnCanvas(ctx, letter) {
        var isFill = true;

        var glyph = this.font.glyphs[letter].path;

        ctx.save();

        ctx.beginPath();
        ctx.translate(0, this.glyphIterator.getLineGap());
        //console.log(this.glyphIterator.fontScale);
        //console.log('ss');
        //console.log(this.glyphIterator);
        //console.log(this.glyphIterator.getLineGap() );

        ctx.scale(this.glyphIterator.fontScale, -this.glyphIterator.fontScale);


        letterCanvasRenderer(ctx, glyph);

        if (isFill) {
            ctx.fillStyle = "#000";
            ctx.fill();
        } else {
            ctx.lineWidth = parseInt(1 / this.glyphIterator.fontScale);
            ctx.stroke();
        }


        ctx.restore();

    }

    renderTextOnCanvasTest(ctx, text) {
        var isFill = true;
        var ii;

        ctx.save();
        ctx.translate(0, this.glyphIterator.getLineGap());
        ctx.scale(this.glyphIterator.fontScale, -this.glyphIterator.fontScale);


        for (ii = 0; ii < text.length; ii++) {
            var chr = text.charAt(ii);
            //console.log(chr);
            //console.log(chr);


            ctx.beginPath();
            var glyph = this.font.glyphs[chr];
            ctx.save();
            ctx.translate(this.glyphIterator.pen.x, this.glyphIterator.pen.y);

            letterCanvasRenderer(ctx, glyph.path);


            if (isFill) {
                ctx.fillStyle = "#000";
                ctx.fill();
            } else {
                ctx.lineWidth = parseInt(1 / this.glyphIterator.fontScale);
                ctx.stroke();
            }

            ctx.restore();


            this.glyphIterator.advance(glyph);
        }

        ctx.restore();

    }

    setText(text) {
        var ii;
        this.data = [];

        this.glyphIterator.begin();


        for (ii = 0; ii < text.length; ii++) {
            var chr = text.charAt(ii);

            var glyph = this.font.glyphs[chr];

            var glyphPath = glyph.path;
            var fontHeight = this.font.height;

            var scaledValue = this.glyphIterator.fontScale;
            var glyphPen = this.glyphIterator.pen;
            var arr = glyphPath.map(function (itemInArray) {
                //console.log(itemInArray);
                var arr = [];
                itemInArray.forEach(function (element, index) {
                    if (index == 0) {
                        arr.push(element)
                    } else {
                        if (index % 2 === 0) {
                            arr.push((-element + fontHeight + glyphPen.y) * scaledValue);
                        } else {
                            arr.push((element + glyphPen.x) * scaledValue);
                        }
                    }
                });

                return arr;
            });

            this.data.push(arr);

            this.glyphIterator.advance(glyph);
        }
    }

    renderData(ctx) {
        //console.log(this.data);

        ctx.restore();
        ctx.save();
        ctx.translate( (window.innerWidth - this.glyphIterator.getTextWidth())/2, 100 );
        //ctx.translate()

        this.data.forEach(function (fontPathArr) {
            ctx.beginPath();

            fontPathArr.forEach(function (elem) {
                var letterType = elem[0];

                switch (letterType) {
                    case "m":
                        ctx.moveTo(elem[1], elem[2]);
                        break;
                    case "q":
                        ctx.quadraticCurveTo(elem[1], elem[2], elem[3], elem[4]);
                        break;
                    case "c":
                        ctx.bezierCurveTo(elem[1], elem[2], elem[3], elem[4], elem[5], elem[6]);
                        break;
                    case "l":
                        ctx.lineTo(elem[1], elem[2]);
                        break;
                }
            })

            ctx.closePath();
            ctx.fillStyle = "#26A69A";
            ctx.fill();

        });

    }

    calculateDistance() {
        var prevX, prevY;
        var pprevX, pprevY;
        var ii;
        var xPos, yPos;
        var rate0, rate1;
        var maxVal = 10;

        this.distanceArr = this.data.map(function (elem) {
            //console.log(index);
            //var letterType = elem[0]
            var totalDistance = 0;
            elem.forEach(function (data) {
                var letterType = data[0];

                switch (letterType) {
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
        });

    }

    dividePoint(ptNumber = 100) {
        if (this.distanceArr) this.calculateDistance();
        var prevX, prevY;
        var pprevX, pprevY;
        var ii;
        var maxVal = 10;
        var rate0, rate1;
        var xPos, yPos;

        this.dividedPoints = [];

        this.data.forEach(function (pt, index) {
            var distanceUnit = this.distanceArr[index] / ptNumber;
            //console.log(this.distanceArr);
            //console.log(distanceUnit);

            this.dividedPoints.push([]);


            var totalDistance = 0;

            pt.forEach(function (data) {
                var letterType = data[0];

                switch (letterType) {
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




                            totalDistance += distance;

                            if (totalDistance >= distanceUnit) {
                                var pts = [];
                                while (totalDistance >= distanceUnit) {

                                    var leftDistance = totalDistance - distanceUnit;
                                    var rate = (distance - leftDistance) / distance;
                                    var leftRate = 1 - rate;

                                    var x1 = leftRate * pprevX + rate * xPos;
                                    var y1 = leftRate * pprevY + rate * yPos;

                                    var pt = {x: x1, y: y1};
                                    //this.dividedPoints[this.dividedPoints.length - 1].push(pt);
                                    pts.push(pt);

                                    totalDistance -= distanceUnit;
                                }

                                for (var jj = pts.length - 1; jj >= 0; jj--) {
                                    this.dividedPoints[this.dividedPoints.length - 1].push(pts[jj]);
                                };
                            }

                            pprevX = xPos;
                            pprevY = yPos;

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



                            totalDistance += distance;

                            if (totalDistance >= distanceUnit) {
                                var pts = [];
                                while (totalDistance >= distanceUnit) {

                                    var leftDistance = totalDistance - distanceUnit;
                                    var rate = (distance - leftDistance) / distance;
                                    var leftRate = 1 - rate;

                                    var x1 = leftRate * pprevX + rate * xPos;
                                    var y1 = leftRate * pprevY + rate * yPos;

                                    var pt = {x: x1, y: y1};
                                    //this.dividedPoints[this.dividedPoints.length - 1].push(pt);
                                    pts.push(pt);

                                    totalDistance -= distanceUnit;
                                }

                                for (var jj = pts.length - 1; jj >= 0; jj--) {
                                    this.dividedPoints[this.dividedPoints.length - 1].push(pts[jj]);
                                }

                            }

                            pprevX = xPos;
                            pprevY = yPos;
                        }

                        prevX = pprevX = data[5];
                        prevY = pprevY = data[6];
                        break;
                    case "l":

                        var distance = getDistance({x: prevX, y: prevY}, {x: data[1], y: data[2]});

                        totalDistance += distance;


                        if (totalDistance >= distanceUnit) {
                            var pts = [];
                            while (totalDistance >= distanceUnit) {
                                var leftDistance = totalDistance - distanceUnit;
                                var rate = (distance - leftDistance) / distance;
                                var leftRate = 1 - rate;

                                var x1 = leftRate * prevX + rate * data[1];
                                var y1 = leftRate * prevY + rate * data[2];

                                var pt = {x: x1, y: y1};
                                pts.push(pt);

                                totalDistance -= distanceUnit;
                            }

                            for (var ii = pts.length - 1; ii >= 0; ii--) {
                                this.dividedPoints[this.dividedPoints.length - 1].push(pts[ii]);
                            }
                        }

                        prevX = pprevX = data[1];
                        prevY = pprevY = data[2];

                        break;
                }




            }.bind(this));


            if(this.dividedPoints[this.dividedPoints.length-1].length < ptNumber){
                var ppt = pt[pt.length - 1];

                this.dividedPoints[this.dividedPoints.length-1].push( {x: ppt[ppt.length-2], y: ppt[ppt.length-1]} );
            }

        }.bind(this))


    }




    renderLine (ctx){
        var prevX, prevY;
        var ii;
        var xPos, yPos;
        var rate0, rate1;
        var maxVal = 10;

        this.distanceArr = this.data.map(function (elem) {
            //console.log(index);
            //var letterType = elem[0]
            var totalDistance = 0;
            elem.forEach(function (data) {
                var letterType = data[0];

                switch (letterType) {
                    case "m":
                        prevX = data[1];
                        prevY = data[2];
                        break;
                    case "q":

                        for (ii = 0; ii <= maxVal; ii++) {
                            rate0 = ii / maxVal;
                            rate1 = 1.0 - rate0;

                            xPos = rate1 * rate1 * prevX + 2 * rate0 * rate1 * data[1] + rate0 * rate0 * data[3];
                            yPos = rate1 * rate1 * prevY + 2 * rate0 * rate1 * data[2] + rate0 * rate0 * data[4];

                            var distance = getDistance({x: prevX, y: prevY}, {x: xPos, y: yPos});

                            prevX = xPos;
                            prevY = yPos;

                            totalDistance += distance;
                        }

                        prevX = data[3];
                        prevY = data[4];
                        break;
                    case "c":

                        for (ii = 0; ii <= maxVal; ii++) {
                            rate0 = ii / maxVal;
                            rate1 = 1.0 - rate0;

                            xPos = rate1 * rate1 * rate1 * prevX + 3 * rate0 * rate1 * rate1 * data[1] + 3 * rate0 * rate0 * rate1 * data[3] + rate0 * rate0 * rate0 * data[5];
                            yPos = rate1 * rate1 * rate1 * prevY + 3 * rate0 * rate1 * rate1 * data[1] + 3 * rate0 * rate0 * rate1 * data[4] + rate0 * rate0 * rate0 * data[6];
                            var distance = getDistance({x: prevX, y: prevY}, {x: xPos, y: yPos});

                            prevX = xPos;
                            prevY = yPos;

                            totalDistance += distance;
                        }

                        prevX = data[5];
                        prevY = data[6];
                        break;
                    case "l":

                        var distance = getDistance({x: prevX, y: prevY}, {x: data[1], y: data[2]});

                        totalDistance += distance;

                        prevX = data[1];
                        prevY = data[2];
                        break;
                }

            });

            return totalDistance;
        });

    }


    renderPt (ctx) {
        /*
        ctx.beginPath();
        ctx.arc()
        */


        ctx.save();
        ctx.translate( (window.innerWidth - this.glyphIterator.getTextWidth())/2, 100 );

        this.dividedPoints.forEach(function(points, index){
            //console.log(element);
            points.forEach(function(point){
                //console.log(point);
                ctx.beginPath();
                ctx.fillStyle = "#000";
                ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI, false);
                ctx.fill();
            });
        });

        ctx.restore();
    }

}


module.exports = FontpathRenderer;
