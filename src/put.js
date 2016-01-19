'use strict';

/* eslint no-unused-vars: 0 */

module.exports.update = function update( fullPath, data ) {
    // TODO: Push data to the bucket, then update mongo if needed

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.move = function move( fullPath, data ) {
    // TODO: Rename resource in the bucket, then update mongo with the new path

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.rename = function rename( fullPath, data ) {
    // TODO: Rename a resource in the bucket, then update mongo

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};
