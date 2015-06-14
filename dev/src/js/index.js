var React = require('react');
window.React = React;

var AppStore = require('./stores/app-store');
var AppAction = require('./actions/app-action');
var CONSTANTS = require('./utils/constants');

var Slider = require('./components/slider/index.jsx');
var CanvasApp = require('./components/app-canvas/index.jsx');

class App extends React.Component {
    constructor(props){
        super(props);

        this.state = {count : 0}
    }

    componentWillMount(){
    }

    render() {

        var width = 500;
        var style = {
            width : "100%",
            height: "100%"
        };

        return (<div style={style}>
                    <CanvasApp />
                </div>);

        //<Slider value = {AppStore.get("sliderValue")} MIN_VALUE={10} MAX_VALUE={100} width={width} />
    }
}


require('domready')(() => {
  //show canvas demo
    React.render(<App />, document.body);

});

