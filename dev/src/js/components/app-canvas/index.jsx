"use strict";

var devicePixelRatio = window.devicePixelRatio || 1;
var util = require('./fonts/fontpath-util');
var Font = require('../../data/robot-font');

var FontPathRenderer = require('./fonts/fontpath-renderer');
var helloText = "hello";

//var fontPathRenderer = new FontPathRenderer( helloText, Font, 120 );
var TypeRenderer = require('./fonts/type-renderer');
var typeRenderer ;
var AppStore = require('../../stores/app-store');
var CONSTANTS = require('../../utils/constants');

class AppCanvas extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            canvasWidth : window.innerWidth,
            canvasHeight: window.innerHeight
        }
    }

    componentWillMount(){
        AppStore.on(CONSTANTS.CREATE_LAYOUT, this.onCreateLayoutHandler.bind(this));

        typeRenderer = new TypeRenderer(Font, 120);
    }

    componentDidMount(){
        this.canvas = React.findDOMNode(this);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        typeRenderer.render(this.ctx);


    }

    onCreateLayoutHandler(){
        console.log('onCreateLayoutHandler');
        this.setState({
            canvasHeight : AppStore.get("appHeight")
        })
    }

    onChangeSliderHandler(){

        var dividedPtNum = AppStore.get('sliderValue') | 0;

        if( dividedPtNum != this.dividedPtNum){
            this.ctx.restore();
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            this.ctx.save();

            fontPathRenderer.dividePoint(dividedPtNum);
            fontPathRenderer.renderPt(this.ctx);

            this.dividedPtNum = dividedPtNum;
        }
    }

    render(){
        var width = this.state.canvasWidth * devicePixelRatio;
        var height = this.state.canvasHeight * devicePixelRatio;
        var style = {
            width  : `${this.state.canvasWidth}px`,
            height : `${this.state.canvasHeight}px`
        };

        return (
            <canvas style={style} width={width} height={height} />
        );
    }
}

module.exports = AppCanvas;
