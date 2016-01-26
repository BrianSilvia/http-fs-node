'use strict';

const errObject = {
    'NOT_ALLOWED': { status: 403, message: 'User does not have permission.' },
    'RESOURCE_NOT_FOUND': { status: 404, message: 'Resource not found.' },
    'RESOURCE_EXISTS': { status: 409, message: 'Requested resource already exists.' },
    'REQUEST_DATA_TOO_LARGE': { status: 413, message: 'Request data too large.' },
    'INVALID_RESOUCE_TYPE': { status: 415, message: 'Invalid resource type.' },
    'RESOURCE_FAILED_TO_SAVE': { status: 500, message: 'Resource failed to save.' },
    'INVALID_ACTION': { status: 501, message: 'Invalid action.' },
    'INVALID_PARAMETERS': { status: 501, message: 'Invalid parameters.' },
    'NOT_IMPLEMENTED': { status: 501, message: 'Not Implemented.' },

    'DEFAULT_SERVER_ERROR': { status: 500, message: 'Internal Server Error. Please try again later.' },
};

module.exports.errorResponse = function errorResponse( errorCode ) {
    return errObject[errorCode] ? errObject[errorCode] : errObject.DEFAULT_SERVER_ERROR;
};

// Checks for null / empty string
module.exports.isValid = function isValid( fullPath ) {
    return ( !fullPath || !!fullPath.length );
};

// If it has a trailing '/', then it's a directory.
module.exports.isDirectory = function isDirectory( fullPath ) {
    if ( !module.exports.isValid( fullPath )) {
        throw new Error( 'RESOURCE_NOT_FOUND' );
    }

    return fullPath === '/' || fullPath.split( '/' ).pop() === '';
};
