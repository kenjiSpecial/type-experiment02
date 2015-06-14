var AppAction = require('../../../actions/app-action');
var AppStore = require('../../../stores/app-store');


class SliderButton extends React.Component {
    constructor(props) {
        super(props);

        this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this);
        this.onMouseUpHandler = this.onMouseUpHandler.bind(this);

        this.x = 0;
        this.state = {rate: 0, backOpacity: 0, value : AppStore.get("sliderValue") };
    }

    componentWillMount(){
        this.x =  (this.props.value - this.props.MIN_VALUE) / (this.props.MAX_VALUE - this.props.MIN_VALUE) * this.props.width

        this.setState({
            rate : this.x
        });

    }

    componentDidMount(){
        this.dom = React.findDOMNode(this);
    }

    onMouseDownHandler(event){
        this.mouseX = event.clientX;
        this.isMouseDown = true;

        window.addEventListener("mousemove", this.onMouseMoveHandler);
        window.addEventListener("mouseup", this.onMouseUpHandler);

        event.preventDefault();
    }

    onMouseEnterHandler(event){
        this.isMouseEnter = true;

        this.setState({
            backOpacity : .3
        })
    }


    onMouseUpHandler(event){
        this.isMouseDown = false;

        if(!this.isMouseEnter){
            this.setState({
                backOpacity : 0
            });
        }


        window.removeEventListener("mousemove", this.onMouseMoveHandler);
        window.removeEventListener("mouseup", this.onMouseUpHandler);
    }


    onMouseMoveHandler(event){
        var mouseX = event.clientX;
        var dx = mouseX - this.mouseX;

        this.x += dx;

        this.mouseX = event.clientX;

        this.setSlider();
    }

    onMouseLeaveHandler (event){
        this.isMouseEnter = false;
        if(this.isMouseDown) return;

        this.setState({
            backOpacity : 0
        })
    }

    setSlider(){
        this.rate = this.x;

        if( this.rate == null ) this.rate = 0;
        if( this.rate < 0) this.rate = 0;
        if( this.rate > this.props.width ) this.rate = this.props.width;

        var value = (this.rate ) / this.props.width * (this.props.MAX_VALUE - this.props.MIN_VALUE) + this.props.MIN_VALUE;

        AppAction.changeSlider(value);

        this.setState({
            rate : this.rate,
            value : parseInt(value)
        });


    }

    render(){
        var mainRad = 40;
        var rad = 28;
        var margin = (mainRad - rad)/2;

        //console.log(marginLeft);

        var mainStyle = {
            position        : "absolute",
            width           : mainRad,
            height          : mainRad,
            top             : -mainRad/2,
            left            : -mainRad/2 + this.state.rate,
            cursor          : "move"
        };

        var backStyle = {
            position : "absolute",
            top : 0, left: 0,
            borderRadius : mainRad,
            width : mainRad,
            height: mainRad,
            opacity : this.state.backOpacity,
            backgroundColor : "#009688"
        };

        var style = {
            position        : "absolute",
            borderRadius    : rad/2,
            width           : rad,
            height          : rad,
            top             : margin,
            left            : margin,
            backgroundColor : "#009688"
        };

        var fontStyle = {
            position: "absolute",
            fontSize : 11,
            color : "#fff",
            width : mainRad,
            height: mainRad,
            textAlign : "center",
            lineHeight : mainRad + "px",
            verticalAlign : "middle"
        };

        return (
            <div onMouseEnter={this.onMouseEnterHandler.bind(this)}
                 onMouseLeave={this.onMouseLeaveHandler.bind(this)}
                 onMouseDown={this.onMouseDownHandler.bind(this)}
                 style={mainStyle}>
                <div style={backStyle}/>
                <div style={style}/>
                <div style={fontStyle}>{this.state.value}</div>
            </div>
        )
    }
}

module.exports = SliderButton;



