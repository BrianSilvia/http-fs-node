'use strict';

const logger = require( 'brinkbit-logger' )({ __filename });

const errObject = {
    INVALID_RESOURCE: { status: 404, message: 'Resource does not exist.' },
    INVALID_RESOURCE_PATH: { status: 404, message: 'Invalid path.' },
    INVALID_PATH_OR_RESOURCE: { status: 404, message: 'Invalid path or resource.' },
    RESOURCE_EXISTS: { status: 409, message: 'Requested resource already exists.' },
    REQUEST_DATA_TOO_LARGE: { status: 413, message: 'Request data too large.' },
    INVALID_RESOUCE_TYPE: { status: 415, message: 'Invalid resource type.' },
    INVALID_ACTION: { status: 501, message: 'Invalid action.' },
    INVALID_PARAMETERS: { status: 501, message: 'Invalid parameters.' },
    DEFAULT_SERVER_ERROR: { status: 500, message: 'Internal Server Error. Please try again later.' },
};

module.exports.errorResponse = function errorResponse( errorCode ) {
    logger.info( `errorCode: ${errorCode}` );
    const obj = errObject[errorCode] ? errObject[errorCode] : errObject.DEFAULT_SERVER_ERROR;
    logger.error( `code: ${errorCode}, message: ${obj.message}` );
    return obj;
};
