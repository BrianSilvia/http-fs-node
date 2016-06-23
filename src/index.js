'use strict';

const R = require( 'ramda' ); // eslint-disable-line id-length
const utils = require( './utils.js' );
const logger = require( 'brinkbit-logger' )({ __filename });

function getFlags( data ) {
    const flags = ( data && data.parameters && data.parameters.flags ) ? data.parameters.flags : [];
    logger.info( `Flags for current operation: '${flags}'` );
    return flags;
}

const alias = R.curry(( dataStore, GUID, data ) =>
    dataStore.alias( GUID, data )
);

const read = R.curry(( dataStore, GUID, data ) =>
    dataStore.read( GUID, getFlags( data ))
);

const search = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.query ) return Promise.reject( 'INVALID_PARAMETERS' );

    logger.info( `Search: valid parameters, calling into dataStore.search for ${GUID} with ${data.parameters.query}` );
    return dataStore.search(
        GUID,
        data.parameters.query,
        data.parameters.sort || null,
        getFlags( data )
    );
});

const inspect = R.curry(( dataStore, GUID, data ) => {
    const fields = ( data.parameters && data.parameters.fields ) ? data.parameters.fields : null;
    logger.info( `Attempting to inspect ${GUID} for fields: ${fields}` );
    return dataStore.inspect( GUID, fields );
});

const download = R.curry(( dataStore, GUID ) =>
    dataStore.download( GUID, 'zip' )
);

const create = R.curry(( dataStore, GUID, data ) => {
    const params = data.parameters;
    if ( !params ||
        ( params.type !== 'file' && params.type !== 'folder' ) ||
        !params.name ||
        ( params.type === 'folder' && params.content )
    ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }

    logger.info( `Create: valid parameters, calling into dataStore for ${GUID}, with ${params}` );
    return dataStore.create( GUID, params.type, params.name, params.content, getFlags( data ));
});

const bulk = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.resources ) return Promise.reject( 'INVALID_PARAMETERS' );

    logger.info( `Bulk: valid parameters, calling into dataStore for ${GUID}, for ${data.parameters.resources}` );
    return dataStore.bulk( GUID, data.parameters.resources, getFlags( data ));
});

const copy = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.destination ) return Promise.reject( 'INVALID_PARAMETERS' );

    logger.info( `Copy: valid parameters. Calling into dataStore to copy ${GUID} to ${data.parameters.destiantion}` );
    return dataStore.copy( GUID, data.parameters.destination, getFlags( data ));
});

const update = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.content ) return Promise.reject( 'INVALID_PARAMETERS' );

    logger.info( `Update: valid parameters. Calling into dataStore to update ${GUID}` );
    return dataStore.update( GUID, data.parameters.content, getFlags( data ));
});

const move = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.destination ) return Promise.reject( 'INVALID_PARAMETERS' );

    logger.info( `Move: valid parameters. Calling into dataStore to move ${GUID} to ${data.parameters.destination}` );
    return dataStore.move( GUID, data.parameters.destination, getFlags( data ));
});

const rename = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.name ) return Promise.reject( 'INVALID_PARAMETERS' );

    logger.info( `Rename: valid parameters. Calling into dataStore to rename ${GUID} to ${data.parameters.name}` );
    return dataStore.rename( GUID, data.parameters.name, getFlags( data ));
});

const destroy = R.curry(( dataStore, GUID ) => dataStore.destroy( GUID ));

const takeAction = R.curry(( permissions, methods, GUID, userId, data ) => {
    if ( !GUID ) return Promise.reject( utils.errorResponse( 'INVALID_RESOURCE' ));

    if ( !data || !data.action ) {
        logger.info( 'Calling into default action.' );
        return methods.default( GUID, data )
        .catch( err => Promise.reject( utils.errorResponse( err )));
    }

    if ( !methods.hasOwnProperty( data.action )) return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));

    logger.info( `Calling to verify, before invoking ${data.action}` );
    return Promise.resolve()
    .then(( ) => permissions.verify( GUID, userId, data.action ))
    .then(() => methods[ data.action ]( GUID, data ))
    .catch( err => Promise.reject( utils.errorResponse( err )));
});


module.exports = configuration => {
    const dataStore = configuration.dataStore;
    const permissions = configuration.permissions;

    logger.info( `Initializing module with ${JSON.stringify( configuration )}` );

    const GET = {
        default: read( dataStore ),
        read: read( dataStore ),
        alias: alias( dataStore ),
        search: search( dataStore ),
        inspect: inspect( dataStore ),
        download: download( dataStore ),
    };

    const POST = {
        default: create( dataStore ),
        create: create( dataStore ),
        bulk: bulk( dataStore ),
        copy: copy( dataStore ),
    };

    const PUT = {
        default: update( dataStore ),
        update: update( dataStore ),
        move: move( dataStore ),
        rename: rename( dataStore ),
    };

    const DELETE = {
        default: destroy( dataStore ),
        destroy: destroy( dataStore ),
    };

    const method = takeAction( permissions );

    const res = {};
    res.GET = method( GET );
    res.POST = method( POST );
    res.PUT = method( PUT );
    res.DELETE = method( DELETE );
    res.actions = { GET, POST, PUT, DELETE };

    return res;
};
