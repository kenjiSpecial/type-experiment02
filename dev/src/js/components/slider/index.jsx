var SliderButton = require('./components/slider-button.jsx');

var AppStore = require('../../stores/app-store');
var CONSTANTS = require('../../utils/constants');

class Slider extends React.Component{
    constructor(props){
        super(props);

        this.state = {bgWidth : 0};
    }
    componentWillMount(){
        AppStore.on(CONSTANTS.CHANGE_SLIDER, this.onChangeSliderHandler.bind(this));
        this.onChangeSliderHandler();
    }

    onChangeValueHandler(){
    }

    componentDidMount(){
    }

    onChangeSliderHandler(){

        //this.setState({width : })
        var sliderValue = AppStore.get("sliderValue");
        var width = (sliderValue - this.props.MIN_VALUE) / (this.props.MAX_VALUE - this.props.MIN_VALUE) * this.props.width;

        this.setState({
            bgWidth : width
        });

    }

    render(){
        var containerStyle = {
            position : "absolute",
            bottom   : 300,
            left     : (window.innerWidth - this.props.width)/2
        };

        var style = {
            position : "relative",
            width  : this.props.width,
            height : 1
        };

        var bgStyle = {
            position: "absolute",
            top : 0,
            left: 0,
            width  : this.props.width,
            backgroundColor : "#757575",
            height : 1
        };

        var bgActiveStyle = {
            position: "absolute",
            top : 0,
            left: 0,
            width  : this.state.bgWidth,
            backgroundColor : "#009688",
            height : 1
        };

        return (
            <div style={containerStyle} >
                <div style={style} className="material-slider">
                    <div style={bgStyle} />
                    <div style={bgActiveStyle}/>
                    <SliderButton {...this.props}/>
                </div>
            </div>
        );
    }
}

module.exports = Slider;
