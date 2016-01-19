'use strict';

// TODO: Swap out stubs for ingested modules
const utils = require( './utils.js' );
const fsS3Mongo = require( './fs-s3-mongo-stub.js' );
const brinkbitPermissions = require( './brinkbit-permissions-stub' );

function getFlags( data ) {
    return ( data.parameters && data.parameters.flags ) ? data.parameters.flags : [];
}

module.exports.handleRequest = function handleRequest( user, type, fullPath, data ) {
    // TODO: standardize flags, if they were passed in

    if ( !fullPath || fullPath === '' ) {
        return Promise.reject( utils.errorResponse( 'INVALID_PATH_OR_RESOURCE' ));
    }


    //----------------------------------
    // GET modules
    //----------------------------------


    // READ
    // Required parameters: NONE
    // Optional parameters: NONE
    if ( type === 'GET' && ( !data || !data.action || data.action === 'read' )) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'read' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.read( fullPath, getFlags( ));
    }


    // SEARCH
    // Required parameters: query (string)
    // Optional parameters: sorting (string)
    else if ( type === 'GET' && data.action === 'search' ) {
        if ( !data.parameters || !data.parameters.query ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        // TODO: ensure that resouce is a folder. Reject with INVALID_RESOUCE_TYPE if it's not.

        else if ( !brinkbitPermissions.verify( user, fullPath, 'search' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        const sortObj = data.parameters.sorting || {};
        return fsS3Mongo.search( fullPath, data.parameters.query, sortObj, getFlags( ));
    }


    // INSPECT
    // Required parameters: NONE
    // Optional parameters: fields (array of strings)
    else if ( type === 'GET' && data.action === 'inspect' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'inspect' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.inspect( fullPath, data );
    }


    // DOWNLOAD
    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( type === 'GET' && data.action === 'download' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'download' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.download( fullPath );
    }


    //----------------------------------
    // POST modules
    //----------------------------------


    // CREATE
    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( type === 'POST' && ( !data || !data.action || data.action === 'create' )) {
        if ( !data.parameters || !data.parameters.content ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        // TODO: better validation on resource formatting

        else if ( !brinkbitPermissions.verify( user, fullPath, 'create' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.create( fullPath, data );
    }


    // BULK
    // Required parameters: resources (object, e.g., {resourceName: content }
    // Optional parameters: NONE
    else if ( type === 'POST' && data.action === 'bulk' ) {
        if ( !data.parameters || !data.parameters.resources ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'bulk' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.bulk( fullPath, data );
    }


    // COPY
    // Required parameters: destination (string)
    // Optional parameters: NONE
    else if ( type === 'POST' && data.action === 'copy' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'copy' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.copy( fullPath, data );
    }


    //----------------------------------
    // PUT modules
    //----------------------------------


    // UPDATE
    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( type === 'PUT' && ( !data || !data.action || data.action === 'update' )) {
        if ( !data.parameters || !data.parameters.content ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'update' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.update( fullPath, data );
    }


    // MOVE
    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( type === 'PUT' && data.action === 'move' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'move' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.move( fullPath, data );
    }


    // RENAME
    // Required parameters: name (string)
    // Optional parameters: NONE
    else if ( type === 'PUT' && data.action === 'rename' ) {
        if ( !data.parameters || !data.parameters.name ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'rename' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.rename( fullPath, data );
    }


    //----------------------------------
    // DELETE module
    //----------------------------------


    // DELETE
    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( type === 'DELETE' && ( !data || !data.action || data.action === 'delete' )) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'destroy' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return fsS3Mongo.destroy( fullPath );
    }


    //----------------------------------
    // Invalid action
    //----------------------------------


    return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
};
