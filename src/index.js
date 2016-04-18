'use strict';

const utils = require( './utils.js' );
const R = require( 'ramda' ); // eslint-disable-line id-length

function getFlags( data ) {
    return ( data && data.parameters && data.parameters.flags ) ? data.parameters.flags : [];
}

const alias = R.curry(( dataStore, GUID, data ) =>
    dataStore.alias( GUID, data )
);

const read = R.curry(( dataStore, GUID, data ) =>
    dataStore.read( GUID, getFlags( data ))
);

const search = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.query ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.search(
        GUID,
        data.parameters.query,
        data.parameters.sort || null,
        getFlags( data )
    );
});

const inspect = R.curry(( dataStore, GUID, data ) => {
    const fields = ( data.parameters && data.parameters.fields ) ? data.parameters.fields : null;
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
    return dataStore.create( GUID, params.type, params.name, params.content, getFlags( data ));
});

const bulk = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.resources ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.bulk( GUID, data.parameters.resources, getFlags( data ));
});

const copy = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.destination ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.copy( GUID, data.parameters.destination, getFlags( data ));
});

const update = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.content ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.update( GUID, data.parameters.content, getFlags( data ));
});

const move = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.destination ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.move( GUID, data.parameters.destination, getFlags( data ));
});

const rename = R.curry(( dataStore, GUID, data ) => {
    if ( !data.parameters || !data.parameters.name ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.rename( GUID, data.parameters.name, getFlags( data ));
});

const destroy = R.curry(( dataStore, GUID ) => dataStore.destroy( GUID ));

const takeAction = R.curry(( permissions, methods, GUID, userId, data ) => {
    if ( !GUID ) {
        return Promise.reject( utils.errorResponse( 'INVALID_RESOURCE' ));
    }

    if ( !data || !data.action ) {
        return methods.default( GUID, data )
        .catch( err => Promise.reject( utils.errorResponse( err )));
    }

    if ( !methods.hasOwnProperty( data.action )) {
        return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
    }

    return Promise.resolve()
    .then(( ) => permissions.verify( GUID, userId, data.action ))
    .then(() => methods[ data.action ]( GUID, data ))
    .catch( err => Promise.reject( utils.errorResponse( err )));
});


module.exports = configuration => {
    const dataStore = configuration.dataStore;
    const permissions = configuration.permissions;

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
