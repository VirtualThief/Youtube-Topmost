'use strict'

/**
 * Check if value is null or undefined.
 * @param {*} value 
 * @returns {boolean}
 */
function isNullOrUndefined(value) {
    return value === null
        || value === undefined;
}

module.exports = {
    isNullOrUndefined,
};