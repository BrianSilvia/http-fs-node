'use strict';

const utils = require( './utils.js' );

function getFlags( data ) {
    return ( data && data.parameters && data.parameters.flags ) ? data.parameters.flags : [];
}

module.exports = configuration => {
    const dataStore = configuration.dataStore;
    const permissions = configuration.permissions;

    return {
        dataStore: dataStore,
        permissions: permissions,

        GET: function GET( userId, fullPath, data ) {
            if ( !fullPath ) {
                return Promise.reject( utils.errorResponse( 'RESOURCE_NOT_FOUND' ));
            }

            // READ
            // Required parameters: NONE
            // Optional parameters: NONE
            else if ( !data || !data.action || data.action === 'read' ) {
                let err = null;

                if ( !permissions.verify( fullPath, userId, 'read' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }
                else if ( utils.isDirectory( fullPath )) {
                    return dataStore.search( fullPath, userId, '*', null, getFlags( data ));
                }

                return dataStore.read( fullPath, userId );
            }


            // SEARCH
            // Required parameters: query (string)
            // Optional parameters: sorting (string)
            else if ( data.action === 'search' ) {
                let err = null;

                if ( !data.parameters || !data.parameters.query ) {
                    err = 'INVALID_PARAMETERS';
                }
                else if ( !utils.isDirectory( fullPath )) {
                    err = 'INVALID_RESOUCE_TYPE';
                }
                else if ( !permissions.verify( fullPath, userId, 'search' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                const sorting = data.parameters.sorting || null;
                return dataStore.search( fullPath, userId, data.parameters.query, sorting, getFlags( data ));
            }


            // INSPECT
            // Required parameters: NONE
            // Optional parameters: fields (array of strings)
            else if ( data.action === 'inspect' ) {
                let err = null;

                if ( !permissions.verify( fullPath, userId, 'inspect' )) {
                    err = 'NOT_ALLOWED';
                }
                else if ( utils.isDirectory( fullPath )) {
                    err = 'INVALID_RESOUCE_TYPE';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                const fields = ( data.parameters && data.parameters.fields ) ? data.parameters.fields : null;
                return dataStore.inspect( fullPath, userId, fields );
            }


            // DOWNLOAD
            // Required parameters: NONE
            // Optional parameters: NONE
            else if ( data.action === 'download' ) {
                let err = null;

                if ( !permissions.verify( fullPath, userId, 'download' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.download( fullPath, userId, 'zip' );
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },

        POST: function GET( userId, fullPath, data ) {
            if ( !fullPath ) {
                return Promise.reject( utils.errorResponse( 'RESOURCE_NOT_FOUND' ));
            }

            // CREATE
            // Required parameters: content (multi-part form upload)
            // Optional parameters: NONE
            else if ( !data || !data.action || data.action === 'create' ) {
                let err = null;

                if ( !data.parameters || !data.parameters.content ) {
                    err = 'INVALID_PARAMETERS';
                }
                else if ( !permissions.verify( fullPath, userId, 'create' )) {
                    err = 'NOT_ALLOWED';
                }

                // TODO: better validation on resource formatting

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.create( fullPath, userId, data.parameters.content, getFlags( data ));
            }


            // BULK
            // Required parameters: resources (object, e.g., {resourceName: content }
            // Optional parameters: NONE
            else if ( data.action === 'bulk' ) {
                let err = null;

                if ( !data.parameters || !data.parameters.resources ) {
                    err = 'INVALID_PARAMETERS';
                }
                else if ( !permissions.verify( fullPath, userId, 'bulk' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.bulk( fullPath, userId, data.parameters.resources, getFlags( data ));
            }


            // COPY
            // Required parameters: destination (string)
            // Optional parameters: NONE
            else if ( data.action === 'copy' ) {
                let err = null;

                if ( !data.parameters || !data.parameters.destination ) {
                    err = 'INVALID_PARAMETERS';
                }
                else if ( !permissions.verify( fullPath, userId, 'copy' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.copy( fullPath, userId, data.parameters.destination, getFlags( data ));
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },

        PUT: function PUT( userId, fullPath, data ) {
            if ( !fullPath ) {
                return Promise.reject( utils.errorResponse( 'RESOURCE_NOT_FOUND' ));
            }


            // UPDATE
            // Required parameters: content (multi-part form upload)
            // Optional parameters: NONE
            else if ( !data || !data.action || data.action === 'update' ) {
                let err = null;

                if ( !data.parameters || !data.parameters.content ) {
                    err = 'INVALID_PARAMETERS';
                }
                else if ( utils.isDirectory( fullPath )) {
                    err = 'INVALID_RESOUCE_TYPE';
                }
                else if ( !permissions.verify( fullPath, userId, 'update' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.update( fullPath, userId, data.parameters.content, getFlags( data ));
            }


            // MOVE
            // Required parameters: content (multi-part form upload)
            // Optional parameters: NONE
            else if ( data.action === 'move' ) {
                let err = null;

                if ( !data.parameters || !data.parameters.destination ) {
                    err = 'INVALID_PARAMETERS';
                }
                else if ( !permissions.verify( fullPath, userId, 'move' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.move( fullPath, userId, data.parameters.destination, getFlags( data ));
            }


            // RENAME
            // Required parameters: name (string)
            // Optional parameters: NONE
            else if ( data.action === 'rename' ) {
                let err = null;

                if ( !data.parameters || !data.parameters.name ) {
                    err = 'INVALID_PARAMETERS';
                }
                else if ( !permissions.verify( fullPath, userId, 'rename' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.rename( fullPath, userId, data.parameters.name, getFlags( data ));
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },

        DELETE: function DELETE( userId, fullPath, data ) {
            if ( !fullPath ) {
                return Promise.reject( utils.errorResponse( 'RESOURCE_NOT_FOUND' ));
            }


            // DESTROY
            // Required parameters: NONE
            // Optional parameters: NONE
            else if ( !data || !data.action || data.action === 'destroy' ) {
                let err = null;

                if ( !permissions.verify( fullPath, userId, 'destroy' )) {
                    err = 'NOT_ALLOWED';
                }

                if ( err ) {
                    return Promise.reject( utils.errorResponse( err ));
                }

                return dataStore.destroy( fullPath, userId );
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },
    };
};
