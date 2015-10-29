'use strict';

/* eslint no-unused-vars: 0 */

module.exports.read = function read( fullPath ) {
    // TODO: Hit w3 bucket and retrieve

    return Promise.resolve({ status: 'not yet implemented' });
};

module.exports.search = function search( fullPath, data ) {
    // TODO: Hit mongo and retrieve folder contents

    return Promise.resolve({ status: 'not yet implemented' });
};

module.exports.inspect = function inspect( fullPath, data ) {
    // TODO: Hit mongo and retrieve metadata for the resource

    return Promise.resolve({ status: 'not yet implemented' });
};

module.exports.download = function handleDownload( fullPath ) {
    // TODO: Hit w3 bucket and retrieve, then compress

    return Promise.resolve({ status: 'not yet implemented' });
};
