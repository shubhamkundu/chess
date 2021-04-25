const _ = require('lodash');

module.exports = {
    validateString: (s) => {
        return _.isString(s) && !_.isEmpty(s.trim());
    }
};