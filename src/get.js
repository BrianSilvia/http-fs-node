'use strict';

/* eslint no-unused-vars: 0 */

const utils = require( './utils.js' );

module.exports.read = function read( fullPath, data ) {
    if ( utils.isDirectory( fullPath )) {
        // TODO: call into fs-s3-mongo.read()
        return Promise.reject({ code: 501, message: 'Not implemented.' });
    }

    // TODO: call into fs-s3-mongo.search()
    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.search = function search( fullPath, data ) {
    // TODO: Hit mongo and retrieve folder contents

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.inspect = function inspect( fullPath, data ) {
    // TODO: Hit mongo and retrieve metadata for the resource

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.download = function handleDownload( fullPath, data ) {
    // TODO: Hit w3 bucket and retrieve, then compress

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};
