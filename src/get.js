'use strict';

/* eslint no-unused-vars: 0 */

// TODO: handle proper validation of the path and resource
function handleValidation( path, resource ) {
    let retval = true;

    if ( path === '' ) {
        retval = 'INVALID_RESOURCE_PATH';
    } else if ( resource === '' ) {
        retval = 'INVALID_RESOURCE';
    }

    return retval;
}

module.exports.get = function get( path, resource ) {
    const isValid = handleValidation( path, resource );

    if ( isValid !== true ) {
        return Promise.resolve({ status: isValid });
    }

    return Promise.resolve({});
};

module.exports.search = function search( path, resource, query, sorting, recursive ) {
    const isValid = handleValidation( path, resource );

    if ( isValid !== true ) {
        return Promise.resolve({ status: isValid });
    }

    return Promise.resolve({});
};

module.exports.inspect = function inspect( path, resource, fields ) {
    const isValid = handleValidation( path, resource );

    if ( isValid !== true ) {
        return Promise.resolve({ status: isValid });
    }

    return Promise.resolve({});
};

module.exports.download = function handleDownload( path, resource ) {
    const isValid = handleValidation( path, resource );

    if ( isValid !== true ) {
        return Promise.resolve({ status: isValid });
    }

    return Promise.resolve({});
};
