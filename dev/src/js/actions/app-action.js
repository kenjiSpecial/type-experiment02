
var AppDispatcher = require('../dispatcher/dispatcher');
var CONSTANTS     = require('../utils/constants');

var AppAction = {

    changeSlider : function(value) {
        AppDispatcher.dispatch({
            actionType : CONSTANTS.CHANGE_SLIDER,
            value : value
        })
    },

    createLayout : function(height) {
        AppDispatcher.dispatch({
            actionType : CONSTANTS.CREATE_LAYOUT,
            height : height
        });
    }
};

module.exports = AppAction;
