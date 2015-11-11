'use strict';

const utils = require( './utils.js' );
const getModule = require( './get.js' );
const postModule = require( './post.js' );
const putModule = require( './put.js' );
const deleteModule = require( './delete.js' );

module.exports.handleRequest = function handleRequest( type, fullPath, data ) {
    //----------------------------------
    // GET modules
    //----------------------------------

    // Required parameters: NONE
    // Optional parameters: NONE
    if ( type === 'GET' && ( !data || !data.action || data.action === 'read' )) {
        return getModule.read( fullPath );
    }

    // Required parameters: query (string)
    // Optional parameters: sorting (string)
    else if ( type === 'GET' && data.action === 'search' ) {
        if ( !data.parameters || !data.parameters.query ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        return getModule.search( fullPath, data );
    }

    // Required parameters: NONE
    // Optional parameters: fields (array of strings)
    else if ( type === 'GET' && data.action === 'inspect' ) {
        return getModule.inspect( fullPath, data );
    }

    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( type === 'GET' && data.action === 'download' ) {
        return getModule.download( fullPath );
    }

    //----------------------------------
    // POST modules
    //----------------------------------

    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( type === 'POST' && ( !data || !data.action || data.action === 'create' )) {
        if ( !data.parameters || !data.parameters.content ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        return postModule.create( fullPath, data );
    }

    // TODO: better validation on resource formatting
    // Required parameters: resources (object, e.g., {resourceName: content }
    // Optional parameters: NONE
    else if ( type === 'POST' && data.action === 'bulk' ) {
        if ( !data.parameters || !data.parameters.resources ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        return postModule.bulk( fullPath, data );
    }

    // Required parameters: destination (string)
    // Optional parameters: NONE
    else if ( type === 'POST' && data.action === 'copy' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        return postModule.copy( fullPath, data );
    }

    //----------------------------------
    // PUT modules
    //----------------------------------

    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( type === 'PUT' && ( !data || !data.action || data.action === 'update' )) {
        if ( !data.parameters || !data.parameters.content ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        return putModule.update( fullPath, data );
    }

    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( type === 'PUT' && data.action === 'move' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        return putModule.move( fullPath, data );
    }

    // Required parameters: name (string)
    // Optional parameters: NONE
    else if ( type === 'PUT' && data.action === 'rename' ) {
        if ( !data.parameters || !data.parameters.name ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        return putModule.rename( fullPath, data );
    }

    //----------------------------------
    // DELETE module
    //----------------------------------

    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( type === 'DELETE' && ( !data || !data.action || data.action === 'delete' )) {
        return deleteModule.destroy( fullPath );
    }

    //----------------------------------
    // Invalid action
    //----------------------------------

    return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
};
