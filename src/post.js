'use strict';

/* eslint no-unused-vars: 0 */

module.exports.create = function create( fullPath, data ) {
    // TODO: Push to the bucket, then update mongo

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.bulk = function bulk( fullPath, data ) {
    // TODO: Push multiple resources to the bucket, then update mongo

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.copy = function copy( fullPath, data ) {
    // TODO: Copy a resource, optionally update the name, then update mongo

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};
