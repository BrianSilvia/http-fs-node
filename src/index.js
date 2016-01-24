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

        GET: function GET( GUID, userId, data ) {
            if ( !GUID ) {
                return Promise.reject( utils.errorResponse( 'RESOURCE_NOT_FOUND' ));
            }

            // READ
            // Required parameters: NONE
            // Optional parameters: NONE
            else if ( !data || !data.action || data.action === 'read' ) {
                return permissions.verify( GUID, userId, 'read' )
                .then(( ) => {
                    return dataStore.read( GUID, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // ALIAS
            // Required parameters: fullPath (GUID), userId
            // Optional parameters: NONE
            else if ( data && data.action === 'alias' ) {
                let toReturn = null;

                return dataStore.alias( GUID, userId )
                .then( guid => {
                    toReturn = guid;
                    return permissions.verify( guid, 'read' );
                })
                .then(( ) => {
                    return { GUID: toReturn };
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // SEARCH
            // Required parameters: query (string)
            // Optional parameters: sorting (string)
            else if ( data && data.action === 'search' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.query ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( GUID, userId, 'search' );
                })
                .then(( ) => {
                    const sorting = data.parameters.sort || null;
                    return dataStore.search( GUID, data.parameters.query, sorting, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // INSPECT
            // Required parameters: NONE
            // Optional parameters: fields (array of strings)
            else if ( data && data.action === 'inspect' ) {
                return Promise.resolve()
                .then(( ) => {
                    return permissions.verify( GUID, userId, 'inspect' );
                })
                .then(( ) => {
                    const fields = ( data.parameters && data.parameters.fields ) ? data.parameters.fields : null;
                    return dataStore.inspect( GUID, fields );
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // DOWNLOAD
            // Required parameters: NONE
            // Optional parameters: NONE
            else if ( data && data.action === 'download' ) {
                return permissions.verify( GUID, userId, 'download' )
                .then(( ) => {
                    return dataStore.download( GUID, 'zip' );
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },

        POST: function GET( GUID, userId, data ) {
            if ( !GUID ) {
                return Promise.reject( utils.errorResponse( 'RESOURCE_NOT_FOUND' ));
            }

            // CREATE
            // Required parameters: content (multi-part form upload)
            // Optional parameters: NONE
            else if ( !data || !data.action || data.action === 'create' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data || !data.parameters || !data.parameters.content || !data.parameters.name ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( GUID, userId, 'create' );
                })
                .then(( ) => {
                    return dataStore.create( GUID, data.parameters.name, data.parameters.content, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // BULK
            // Required parameters: resources (object, e.g., {resourceName: content }
            // Optional parameters: NONE
            else if ( data && data.action === 'bulk' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.resources ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( GUID, userId, 'bulk' );
                })
                .then(( ) => {
                    return dataStore.bulk( GUID, data.parameters.resources, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // COPY
            // Required parameters: destination (string)
            // Optional parameters: NONE
            else if ( data && data.action === 'copy' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.destination ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( GUID, userId, 'copy' );
                })
                .then(( ) => {
                    return dataStore.copy( GUID, data.parameters.destination, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },

        PUT: function PUT( GUID, userId, data ) {
            if ( !GUID ) {
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

                    return permissions.verify( GUID, userId, 'update' );
                })
                .then(( ) => {
                    return dataStore.update( GUID, data.parameters.content, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // MOVE
            // Required parameters: content (multi-part form upload)
            // Optional parameters: NONE
            else if ( data && data.action === 'move' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.destination ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( GUID, userId, 'move' );
                })
                .then(( ) => {
                    return dataStore.move( GUID, data.parameters.destination, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }


            // RENAME
            // Required parameters: name (string)
            // Optional parameters: NONE
            else if ( data && data.action === 'rename' ) {
                return Promise.resolve()
                .then(( ) => {
                    if ( !data.parameters || !data.parameters.name ) {
                        return Promise.reject( 'INVALID_PARAMETERS' );
                    }

                    return permissions.verify( GUID, userId, 'rename' );
                })
                .then(( ) => {
                    return dataStore.rename( GUID, data.parameters.name, getFlags( data ));
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },

        DELETE: function DELETE( GUID, userId, data ) {
            if ( !GUID ) {
                return Promise.reject( utils.errorResponse( 'RESOURCE_NOT_FOUND' ));
            }


            // DESTROY
            // Required parameters: NONE
            // Optional parameters: NONE
            else if ( !data || !data.action || data.action === 'destroy' ) {
                return permissions.verify( GUID, userId, 'destroy' )
                .then(( ) => {
                    return dataStore.destroy( GUID );
                })
                .catch( err => {
                    return Promise.reject( utils.errorResponse( err ));
                });
            }

            return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
        },
    };
};
