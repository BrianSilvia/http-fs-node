'use strict';

// TODO: Swap out stubs for ingested modules
const utils = require( './utils.js' );
const fsS3Mongo = require( './fs-s3-mongo-stub.js' );
const brinkbitPermissions = require( './brinkbit-permissions-stub' );

function getFlags( data ) {
    return ( data && data.parameters && data.parameters.flags ) ? data.parameters.flags : [];
}

module.exports.GET = function GET( user, fullPath, data ) {
    if ( !fullPath || fullPath === '' ) {
        return Promise.reject( utils.errorResponse( 'INVALID_PATH_OR_RESOURCE' ));
    }

    // READ
    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( !data || !data.action || data.action === 'read' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'read' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        else if ( utils.isDirectory( fullPath )) {
            return fsS3Mongo.search( fullPath, '*', null, getFlags( data ));
        }

        return fsS3Mongo.read( fullPath );
    }


    // SEARCH
    // Required parameters: query (string)
    // Optional parameters: sorting (string)
    else if ( data.action === 'search' ) {
        if ( !data.parameters || !data.parameters.query ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !utils.isDirectory( fullPath )) {
            return Promise.reject( utils.errorResponse( 'INVALID_RESOUCE_TYPE' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'search' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        const sorting = data.parameters.sorting || null;
        return fsS3Mongo.search( fullPath, data.parameters.query, sorting, getFlags( data ));
    }


    // INSPECT
    // Required parameters: NONE
    // Optional parameters: fields (array of strings)
    else if ( data.action === 'inspect' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'inspect' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        else if ( utils.isDirectory( fullPath )) {
            return Promise.reject( utils.errorResponse( 'INVALID_RESOUCE_TYPE' ));
        }

        const fields = ( data.parameters && data.parameters.fields ) ? data.parameters.fields : null;
        return fsS3Mongo.inspect( fullPath, fields );
    }


    // DOWNLOAD
    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( data.action === 'download' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'download' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.download( fullPath, 'zip' );
    }

    return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
};

module.exports.POST = function POST( user, fullPath, data ) {
    if ( !fullPath || fullPath === '' ) {
        return Promise.reject( utils.errorResponse( 'INVALID_PATH_OR_RESOURCE' ));
    }

    // CREATE
    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( !data || !data.action || data.action === 'create' ) {
        if ( !data.parameters || !data.parameters.content ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        // TODO: better validation on resource formatting

        else if ( !brinkbitPermissions.verify( user, fullPath, 'create' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.create( fullPath, data.parameters.content, getFlags( data ));
    }


    // BULK
    // Required parameters: resources (object, e.g., {resourceName: content }
    // Optional parameters: NONE
    else if ( data.action === 'bulk' ) {
        if ( !data.parameters || !data.parameters.resources ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'bulk' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.bulk( fullPath, data.parameters.resources, getFlags( data ));
    }


    // COPY
    // Required parameters: destination (string)
    // Optional parameters: NONE
    else if ( data.action === 'copy' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'copy' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.copy( fullPath, data.parameters.destination, getFlags( data ));
    }

    return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
};

module.exports.PUT = function PUT( user, fullPath, data ) {
    if ( !fullPath || fullPath === '' ) {
        return Promise.reject( utils.errorResponse( 'INVALID_PATH_OR_RESOURCE' ));
    }


    // UPDATE
    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( !data || !data.action || data.action === 'update' ) {
        if ( !data.parameters || !data.parameters.content ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( utils.isDirectory( fullPath )) {
            return Promise.reject( utils.errorResponse( 'INVALID_RESOUCE_TYPE' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'update' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.update( fullPath, data.parameters.content, getFlags( data ));
    }


    // MOVE
    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( data.action === 'move' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'move' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.move( fullPath, data.parameters.destination, getFlags( data ));
    }


    // RENAME
    // Required parameters: name (string)
    // Optional parameters: NONE
    else if ( data.action === 'rename' ) {
        if ( !data.parameters || !data.parameters.name ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'rename' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.rename( fullPath, data.parameters.name, getFlags( data ));
    }

    return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
};

module.exports.DELETE = function DELETE( user, fullPath, data ) {
    if ( !fullPath || fullPath === '' ) {
        return Promise.reject( utils.errorResponse( 'INVALID_PATH_OR_RESOURCE' ));
    }


    // DESTROY
    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( !data || !data.action || data.action === 'destroy' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'destroy' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.destroy( fullPath );
    }

    return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
};
