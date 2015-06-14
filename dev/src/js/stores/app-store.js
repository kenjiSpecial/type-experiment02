var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var AppDispatcher = require('../dispatcher/dispatcher');
var CONSTANTS = require('../utils/constants');

var _apps = {
    sliderValue : 50,
    appHeight : 0
};

var AppStore = assign({}, EventEmitter.prototype, {
    get : function(id) {
        return _apps[id];
    },

    changeSlider : function(value){
        //console.log(value);
        _apps.sliderValue = value;

        this.emit(CONSTANTS.CHANGE_SLIDER);
    },
    
    onCreateLayout : function(height) {
        console.log('onCreate');
        _apps.appHeight = height;
        console.log(_apps.appHeight);

        this.emit(CONSTANTS.CREATE_LAYOUT)
    }
});

AppStore.dispatchToken = AppDispatcher.register(function(action){
    switch (action.actionType){
        case CONSTANTS.CHANGE_SLIDER:
            AppStore.changeSlider(action.value);
            break;
        case CONSTANTS.CREATE_LAYOUT:
            AppStore.onCreateLayout(action.height);
            break;
    }

});


module.exports = AppStore;
