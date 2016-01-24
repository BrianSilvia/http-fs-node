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
                return permissions.verify( fullPath, userId, 'read' )
                .then(( ) => {
                    if ( utils.isDirectory( fullPath )) {
                        return dataStore.search( fullPath, userId, '*', null, getFlags( data ));
                    }

                    return dataStore.read( fullPath, userId );
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // SEARCH
            // Required parameters: query (string)
            // Optional parameters: sorting (string)
            else if ( data.action === 'search' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.query ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }
                    else if ( !utils.isDirectory( fullPath )) {
                        return Promise.reject( 'INVALID_RESOUCE_TYPE' );
                    }

                    return permissions.verify( fullPath, userId, 'search' );
                })
                .then(( ) => {
                    const sorting = data.parameters.sorting || null;
                    return dataStore.search( fullPath, userId, data.parameters.query, sorting, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // INSPECT
            // Required parameters: NONE
            // Optional parameters: fields (array of strings)
            else if ( data.action === 'inspect' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( utils.isDirectory( fullPath )) {
                        return Promise.reject( 'INVALID_RESOUCE_TYPE' );
                    }

                    return permissions.verify( fullPath, userId, 'inspect' );
                })
                .then(( ) => {
                    const fields = ( data.parameters && data.parameters.fields ) ? data.parameters.fields : null;
                    return dataStore.inspect( fullPath, userId, fields );
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // DOWNLOAD
            // Required parameters: NONE
            // Optional parameters: NONE
            else if ( data.action === 'download' ) {
                return permissions.verify( fullPath, userId, 'download' )
                .then(( ) => {
                    return dataStore.download( fullPath, userId, 'zip' );
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
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
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.content ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( fullPath, userId, 'create' );
                })
                .then(( ) => {
                    return dataStore.create( fullPath, userId, data.parameters.content, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // BULK
            // Required parameters: resources (object, e.g., {resourceName: content }
            // Optional parameters: NONE
            else if ( data.action === 'bulk' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.resources ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( fullPath, userId, 'bulk' );
                })
                .then(( ) => {
                    return dataStore.bulk( fullPath, userId, data.parameters.resources, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // COPY
            // Required parameters: destination (string)
            // Optional parameters: NONE
            else if ( data.action === 'copy' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.destination ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( fullPath, userId, 'copy' );
                })
                .then(( ) => {
                    return dataStore.copy( fullPath, userId, data.parameters.destination, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
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
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.content ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }
                    else if ( utils.isDirectory( fullPath )) {
                        return Promise.reject( 'INVALID_RESOUCE_TYPE' );
                    }

                    return permissions.verify( fullPath, userId, 'update' );
                })
                .then(( ) => {
                    return dataStore.update( fullPath, userId, data.parameters.content, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // MOVE
            // Required parameters: content (multi-part form upload)
            // Optional parameters: NONE
            else if ( data.action === 'move' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.destination ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( fullPath, userId, 'move' );
                })
                .then(( ) => {
                    return dataStore.move( fullPath, userId, data.parameters.destination, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // RENAME
            // Required parameters: name (string)
            // Optional parameters: NONE
            else if ( data.action === 'rename' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.name ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( fullPath, userId, 'rename' );
                })
                .then(( ) => {
                    return dataStore.rename( fullPath, userId, data.parameters.name, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
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
                return permissions.verify( fullPath, userId, 'destroy' )
                .then(( ) => {
                    return dataStore.destroy( fullPath, userId );
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },
    };
};
