'use strict';

const utils = require( './utils.js' );
const getModule = require( './get.js' );
const postModule = require( './post.js' );
const putModule = require( './put.js' );
const deleteModule = require( './delete.js' );

// TODO: require module when it's ingested instead of this
const brinkbitPermissions = {
    verify: function verify() {
        return true;
    },
};

module.exports.handleRequest = function handleRequest( user, type, fullPath, data ) {
    // TODO: standardize flags, if they were passed in

    if ( !fullPath || fullPath === '' ) {
        return Promise.reject( utils.errorResponse( 'INVALID_PATH_OR_RESOURCE' ));
    }

    //----------------------------------
    // GET modules
    //----------------------------------

    // Required parameters: NONE
    // Optional parameters: NONE
    if ( type === 'GET' && ( !data || !data.action || data.action === 'read' )) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'read' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return getModule.read( fullPath );
    }

    // Required parameters: query (string)
    // Optional parameters: sorting (string)
    else if ( type === 'GET' && data.action === 'search' ) {
        if ( !data.parameters || !data.parameters.query ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'search' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return getModule.search( fullPath, data );
    }

    // Required parameters: NONE
    // Optional parameters: fields (array of strings)
    else if ( type === 'GET' && data.action === 'inspect' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'inspect' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return getModule.inspect( fullPath, data );
    }

    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( type === 'GET' && data.action === 'download' ) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'download' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

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

        else if ( !brinkbitPermissions.verify( user, fullPath, 'create' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
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

        else if ( !brinkbitPermissions.verify( user, fullPath, 'bulk' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return postModule.bulk( fullPath, data );
    }

    // Required parameters: destination (string)
    // Optional parameters: NONE
    else if ( type === 'POST' && data.action === 'copy' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'copy' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
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

        else if ( !brinkbitPermissions.verify( user, fullPath, 'update' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return putModule.update( fullPath, data );
    }

    // Required parameters: content (multi-part form upload)
    // Optional parameters: NONE
    else if ( type === 'PUT' && data.action === 'move' ) {
        if ( !data.parameters || !data.parameters.destination ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'move' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return putModule.move( fullPath, data );
    }

    // Required parameters: name (string)
    // Optional parameters: NONE
    else if ( type === 'PUT' && data.action === 'rename' ) {
        if ( !data.parameters || !data.parameters.name ) {
            return Promise.reject( utils.errorResponse( 'INVALID_PARAMETERS' ));
        }

        else if ( !brinkbitPermissions.verify( user, fullPath, 'rename' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return putModule.rename( fullPath, data );
    }

    //----------------------------------
    // DELETE module
    //----------------------------------

    // Required parameters: NONE
    // Optional parameters: NONE
    else if ( type === 'DELETE' && ( !data || !data.action || data.action === 'delete' )) {
        if ( !brinkbitPermissions.verify( user, fullPath, 'destroy' )) {
            return Promise.reject( utils.errorResponse( 'NOT_ALLOWED' ));
        }

        return deleteModule.destroy( fullPath );
    }

    //----------------------------------
    // Invalid action
    //----------------------------------

    return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
};
