var util = require('./fontpath-util');

var DEFAULT_TAB_WIDTH = 4;

function GlyphIterator(font, fontSize){
    this._fontSize = undefined;
    this._fontScale = undefined;
    this._font = undefined;

    this.fontScale = 1.0;
    this.kerning = true;
    this.letterSpacing = 0.0;
    this.lineHeight = undefined;

    this.fontSize = typeof fontSize === 'number' ? fontSize : (font ? font.size : undefined);
    this.font = font;

    this.tabWidth = DEFAULT_TAB_WIDTH;
    this._tabGlyph = null;

    this.origin = {x: 0, y: 0};
    this.pen = { x: 0, y: 0 };
}

Object.defineProperty(GlyphIterator.prototype, "font", {
    get : function() {
        return this._font;
    },

    set : function(font) {
        this._font = font;

        if(font) {
            this.fontScale = util.getPxScale(font, this.fontSize);
            this.tabWidth = this._tabWidth;
        }
    }
});

Object.defineProperty(GlyphIterator.prototype, "tabWidth", {
    get : function() {
        return this._tabWidth;
    },

    set: function(val) {
        this._tabWidth = val === 0 || val ? val : DEFAULT_TAB_WIDTH;
        this._tabGlph = {};

        var spaceGlyph = this.font ? this.font.glyphs[" "] : null;
        if(spaceGlyph){
            this._tabGlyph = {};
            for(var k in spaceGlyph){
                this._tabGlyph[k] = spaceGlyph[k];
            }

            if (this._tabGlyph.xoff)
                this._tabGlph.xoff *= this._tabWidth;
        }
    }
});

Object.defineProperty(GlyphIterator.prototype, "fontSize", {
    get: function() {
        if (typeof this._fontSize !== 'number')
            return this.font.bitmap
                ? this.font.size
                : util.pointToPixel(this.font.size)
        return this._fontSize;
    },

    set: function(val) {
        this._fontSize = val;

        //If the font is already set, determine the new scaling factor
        if (this._font) {
            this.fontScale = util.getPxScale(this._font, this._fontSize);
        }
    },
});


GlyphIterator.prototype.getKerning = function(left, right) {
    var font = this.font;

    if(!font || !font.kerning)
        return 0;

    var table = this.kerningTable;

    for (var i=0; i<font.kerning.length; i++) {
        var k = font.kerning[i];
        if (k[0] === left && k[1] === right)
            return k[2];
    }
    return 0;

};


GlyphIterator.prototype.getLineGap = function() {
    //https://github.com/mattdesl/fontpath-glyph-iterator/blob/master/index.js

    //Line height handling is a mess in browsers.
    //Maybe the best solution is to encourage users to
    //specify pixel line heights if they want to match browser standards,
    //otherwise it's unreasonable to expect the line gaps to line up exactly
    //across all browsers. Example of the disaster:
    //http://lists.w3.org/Archives/Public/www-style/2008Jan/0413.html

    //For reference, some baseline-to-baseline calculations:
    //http://www.microsoft.com/typography/otspec/recom.htm
    //freetype.org/freetype2/docs/reference/ft2-base_interface.html
    //http://www.freetype.org/freetype2/docs/glyphs/glyphs-3.html

    //Unfortunately none of these are producing line-heights that avoid overlapping
    //or resemble browser rendering in any way.

    // If CSS uses 1em or 1, the browser offsets the line by the
    // font's pixel size. If an exact pixel line-height is specified,
    // the browser will use that + a computed "linegap."
    // If 'auto' is specified for line-height, the calculations seem
    // much more complex and browser/platform dependent (not included here).

    var font = this.font,
        scale = this.fontScale;
    var gap = (font.height - font.ascender + Math.abs(font.descender)) * scale;
    var lineHeight = this.lineHeight;

    //console.log('sss');

    lineHeight = (lineHeight===0||lineHeight)
        ? (lineHeight + gap)
        : this.fontSize;
    return lineHeight;

};

GlyphIterator.prototype.begin = function(x, y){
    this.origin.x = x || 0;
    this.origin.y = y || 0;

    this.pen.x = this.origin.x;
    this.pen.y = this.origin.y;
};

GlyphIterator.prototype.advance = function(glyph) {
    //console.log(glyph);
    var advance = glyph.xoff;

    //console.log(this.pen.x);
    this.pen.x += advance + this.letterSpacing;
    return advance;
};

GlyphIterator.prototype.getTextWidth = function() {
    return (this.pen.x * this.fontScale);
};


GlyphIterator.prototype.end = function() {

};





module.exports = GlyphIterator;

