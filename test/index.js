'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
/* eslint new-cap: 0 */

// TODO: add tests for normalized flags

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinon = require( 'sinon' );
const sinonchai = require( 'sinon-chai' );

// TODO: Swap out stub for ingested module
const index = require( '../src/index.js' )({
    dataStore: require( '../src/fs-s3-mongo-stub.js' ),
    permissions: require( '../src/brinkbit-permissions-stub.js' ),
});

chai.use( sinonchai );
chai.use( chaiaspromised );

const userId = '12345';

// Declare spies here to prevent rewrapping them
let readSpy;
let aliasSpy;
let searchSpy;
let inspectSpy;
let downloadSpy;
let createSpy;
let bulkSpy;
let copySpy;
let updateSpy;
let moveSpy;
let renameSpy;
let destroySpy;

beforeEach(() => {
    readSpy = sinon.spy( index.dataStore, 'read' );
    aliasSpy = sinon.spy( index.dataStore, 'alias' );
    searchSpy = sinon.spy( index.dataStore, 'search' );
    inspectSpy = sinon.spy( index.dataStore, 'inspect' );
    downloadSpy = sinon.spy( index.dataStore, 'download' );
    createSpy = sinon.spy( index.dataStore, 'create' );
    bulkSpy = sinon.spy( index.dataStore, 'bulk' );
    copySpy = sinon.spy( index.dataStore, 'copy' );
    updateSpy = sinon.spy( index.dataStore, 'update' );
    moveSpy = sinon.spy( index.dataStore, 'move' );
    renameSpy = sinon.spy( index.dataStore, 'rename' );
    destroySpy = sinon.spy( index.dataStore, 'destroy' );
});

const actions = [ 'read', 'alias', 'search', 'inspect', 'download', 'create', 'bulk', 'copy', 'update', 'move', 'rename', 'destroy' ];
afterEach(() => {
    actions.forEach( action => {
        index.dataStore[action].restore();
    });
});

/* testing folder structure

id: 1, path: /top/
id: 2, path: /top/a.txt
id: 3, path: /top/e.txt
id: 4, path: /top/i.txt
id: 5, path: /top/o.txt
id: 6, path: /top/u.txt
id: 7, path: /top/mid/
id: 8, path: /top/mid/b.txt
id: 9, path: /top/mid/c.txt
id: 10, path: /top/mid/d.txt
id: 11, path: /top/mid/f.txt
id: 12, path: /top/mid/bottom/
id: 13: path: /top/mid/bottom/z.txt

*/

describe( 'Top level routing', () => {
    it( 'should reject with a 404/resource not found error, with an empty path', () => {
        const GUID = '';

        return expect( index.GET( GUID, userId )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Resource not found.',
            });
    });

    it( 'should reject with a 501/invalid action object when given an invalid action', () => {
        const GUID = '1';
        const data = {
            action: 'invalidAction',
        };

        return expect( index.GET( GUID, userId, data )).to.be.rejected
            .and.eventually.deep.equal({
                status: 501,
                message: 'Invalid action.',
            });
    });
});

describe( 'GET API', () => {
    describe( 'read:', () => {
        it( 'should route to dataStore.read() with a GUID by default', () => {
            const GUID = '2';

            return index.GET( GUID, userId )
            .then(( ) => {
                expect( readSpy.calledOnce ).to.be.true;
                expect( readSpy.calledWithExactly( GUID, [ ])).to.be.true;
            });
        });
    });

    describe( 'alias:', () => {
        it( 'should route to dataStore.alias() with a fullPath', () => {
            const fullPath = '/valid/path/here/test.txt';
            const data = {
                action: 'alias',
            };

            return index.GET( fullPath, userId, data )
            .then(( ) => {
                expect( aliasSpy.calledOnce ).to.be.true;
                expect( aliasSpy.calledWithExactly( fullPath, userId )).to.be.true;
            });
        });
    });

    describe( 'search:', () => {
        it( 'should reject with 501/invalid parameters when parameters.query is missing', () => {
            const GUID = '1';
            const data = {
                action: 'search',
                parameters: {
                    noQuery: '*',
                },
            };

            return expect( index.GET( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to dataStore.search() with a GUID, a non-empty query, and no flags', () => {
            const GUID = '1';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                },
            };

            return index.GET( GUID, userId, data )
            .then(( ) => {
                expect( searchSpy.calledOnce ).to.be.true;
                expect( searchSpy.calledWithExactly( GUID, data.parameters.query, null, [ ])).to.be.true;
            });
        });

        it( 'should route to dataStore.search() with a GUID, a non-empty query and pass the -r flag', () => {
            const GUID = '1';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                    flags: ['r'],
                },
            };

            return index.GET( GUID, userId, data )
            .then(( ) => {
                expect( searchSpy.calledOnce ).to.be.true;
                expect( searchSpy.calledWithExactly( GUID, data.parameters.query, null, data.parameters.flags )).to.be.true;
            });
        });

        it( 'should route to dataStore.search() with a GUID, a non-empty query, sorting, and the -r flag', () => {
            const GUID = '1';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                    sort: 'name-ascending',
                    flags: ['r'],
                },
            };

            return index.GET( GUID, userId, data )
            .then(( ) => {
                expect( searchSpy.calledOnce ).to.be.true;
                expect( searchSpy.calledWithExactly( GUID, data.parameters.query, data.parameters.sort, data.parameters.flags )).to.be.true;
            });
        });
    });

    describe( 'inspect:', () => {
        it( 'should route to dataStore.inspect() with a GUID', () => {
            const GUID = '2';
            const data = {
                action: 'inspect',
            };

            return index.GET( GUID, userId, data )
            .then(( ) => {
                expect( inspectSpy.calledOnce ).to.be.true;
                expect( inspectSpy.calledWithExactly( GUID, null )).to.be.true;
            });
        });

        it( 'should route to dataStore.inspect() with a GUID, including any specified fields', () => {
            const GUID = '1';
            const data = {
                action: 'inspect',
                parameters: {
                    fields: [ 'name', 'parent' ],
                },
            };

            return index.GET( GUID, userId, data )
            .then(( ) => {
                expect( inspectSpy.calledOnce ).to.be.true;
                expect( inspectSpy.calledWithExactly( GUID, data.parameters.fields )).to.be.true;
            });
        });
    });

    describe( 'download:', () => {
        it( 'should route to dataStore.download() with a GUID', () => {
            const GUID = '1';
            const data = {
                action: 'download',
            };

            return index.GET( GUID, userId, data )
            .then(( ) => {
                expect( downloadSpy.calledOnce ).to.be.true;
                expect( downloadSpy.calledWithExactly( GUID, 'zip' )).to.be.true;
            });
        });
    });
});

describe( 'POST API', () => {
    describe( 'create:', () => {
        it( 'should reject with 501/invalid parameters when parameters.type is missing', () => {
            const GUID = '1';
            const data = {
                parameters: {
                    content: 'This is a testing file',
                    name: 'test.txt',
                },
            };

            return expect( index.POST( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should reject with 501/invalid parameters when parameters.type is anything other than file or folder', () => {
            const GUID = '1';
            const data = {
                parameters: {
                    content: 'This is a testing file',
                    name: 'test.txt',
                    type: 'notAFileOrFolder',
                },
            };

            return expect( index.POST( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should reject with 501/invalid parameters when parameters.name is missing', () => {
            const GUID = '1';
            const data = {
                parameters: {
                    type: 'file',
                    content: 'This is a testing file.',
                },
            };

            return expect( index.POST( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should reject with 501/invalid parameters when parameters.content is set and type is folder', () => {
            const GUID = '1';
            const data = {
                parameters: {
                    type: 'folder',
                    name: 'test.txt',
                    content: 'This is invalid content for a folder.',
                },
            };

            return expect( index.POST( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to dataStore.create() with a GUID, file type, name and content', () => {
            const GUID = '1';
            const data = {
                parameters: {
                    content: 'this content string',
                    name: 'test.txt',
                    type: 'file',
                },
            };
            const params = data.parameters;

            return index.POST( GUID, userId, data )
            .then(( ) => {
                expect( createSpy.calledOnce ).to.be.true;
                expect( createSpy.calledWithExactly( GUID, params.type, params.name, params.content, [ ])).to.be.true;
            });
        });

        it( 'should route to dataStore.create() with a GUID, file type, name, content, and pass the -f flag', () => {
            const GUID = '1';
            const data = {
                parameters: {
                    content: 'this content string',
                    name: 'test.txt',
                    type: 'file',
                    flags: ['f'],
                },
            };
            const params = data.parameters;

            return index.POST( GUID, userId, data )
            .then(( ) => {
                expect( createSpy.calledOnce ).to.be.true;
                expect( createSpy.calledWithExactly( GUID, params.type, params.name, params.content, data.parameters.flags )).to.be.true;
            });
        });

        it( 'should route to dataStore.create() with a GUID, folder type, and name', () => {
            const GUID = '1';
            const data = {
                parameters: {
                    name: 'test.txt',
                    type: 'folder',
                },
            };
            const params = data.parameters;

            return index.POST( GUID, userId, data )
            .then(( ) => {
                expect( createSpy.calledOnce ).to.be.true;
                expect( createSpy.calledWithExactly( GUID, params.type, params.name, null, [ ])).to.be.true;
            });
        });
    });

    // TODO: Add additional validation tests for bulk()
    describe( 'bulk:', () => {
        it( 'should reject with 501/invalid parameters when parameters.resources is missing', () => {
            const GUID = '1';
            const data = {
                action: 'bulk',
                parameters: {
                    noResources: [],
                },
            };

            return expect( index.POST( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to dataStore.bulk() with a GUID, and an array of resources', () => {
            const GUID = '1';
            const data = {
                action: 'bulk',
                parameters: {
                    resources: {
                        'another_cat_picture': 'raw image data',
                        'the_best_cats/': null,
                    },
                },
            };

            return index.POST( GUID, userId, data )
            .then(( ) => {
                expect( bulkSpy.calledOnce ).to.be.true;
                expect( bulkSpy.calledWithExactly( GUID, data.parameters.resources, [ ])).to.be.true;
            });
        });

        it( 'should route to dataStore.bulk() with a GUID, an array of resources, and pass the -f flag', () => {
            const GUID = '1';
            const data = {
                action: 'bulk',
                parameters: {
                    resources: {
                        'another_cat_picture': 'raw image data',
                        'the_best_cats/': null,
                    },
                    flags: ['f'],
                },
            };

            return index.POST( GUID, userId, data )
            .then(( ) => {
                expect( bulkSpy.calledOnce ).to.be.true;
                expect( bulkSpy.calledWithExactly( GUID, data.parameters.resources, data.parameters.flags )).to.be.true;
            });
        });
    });

    // TODO: Add tests for the different flag combinations
    describe( 'copy:', () => {
        it( 'should reject with 501/invalid parameters when parameters.destination is missing', () => {
            const GUID = '2';
            const data = {
                action: 'copy',
                parameters: {
                    noDestination: '3',
                },
            };

            return expect( index.POST( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to dataStore.copy() with a resource GUID and destination GUID', () => {
            const GUID = '2';
            const data = {
                action: 'copy',
                parameters: {
                    destination: '3',
                },
            };

            return index.POST( GUID, userId, data )
            .then(( ) => {
                expect( copySpy.calledOnce ).to.be.true;
                expect( copySpy.calledWithExactly( GUID, data.parameters.destination, [ ])).to.be.true;
            });
        });

        it( 'should route to dataStore.copy() with a GUID, a destination GUID, and pass the -u, and -f flags', () => {
            const GUID = '2';
            const data = {
                action: 'copy',
                parameters: {
                    destination: '3',
                    flags: [ 'u', 'f' ],
                },
            };

            return index.POST( GUID, userId, data )
            .then(( ) => {
                expect( copySpy.calledOnce ).to.be.true;
                expect( copySpy.calledWithExactly( GUID, data.parameters.destination, data.parameters.flags )).to.be.true;
            });
        });
    });
});

describe( 'PUT API', () => {
    describe( 'update:', () => {
        it( 'should reject with 501/invalid parameters when parameters.content is missing', () => {
            const GUID = '2';
            const data = {
                parameters: {
                    noContent: '',
                },
            };

            return expect( index.PUT( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to dataStore.update() with a GUID and content', () => {
            const GUID = '2';
            const data = {
                parameters: {
                    content: 'this new content string',
                },
            };

            return index.PUT( GUID, userId, data )
            .then(( ) => {
                expect( updateSpy.calledOnce ).to.be.true;
                expect( updateSpy.calledWithExactly( GUID, data.parameters.content, [ ])).to.be.true;
            });
        });

        it( 'should route to dataStore.update() with a GUID, content, and pass the -f flag', () => {
            const GUID = '2';
            const data = {
                parameters: {
                    content: 'this content string',
                    flags: ['f'],
                },
            };

            return index.PUT( GUID, userId, data )
            .then(( ) => {
                expect( updateSpy.calledOnce ).to.be.true;
                expect( updateSpy.calledWithExactly( GUID, data.parameters.content, data.parameters.flags )).to.be.true;
            });
        });
    });

    describe( 'move:', () => {
        it( 'should reject with 501/invalid parameters when parameters.destination is missing', () => {
            const GUID = '2';
            const data = {
                action: 'move',
                parameters: {
                    noDestination: '3',
                },
            };

            return expect( index.PUT( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to dataStore.move() with a GUID and destination', () => {
            const GUID = '2';
            const data = {
                action: 'move',
                parameters: {
                    destination: '3',
                },
            };

            return index.PUT( GUID, userId, data )
            .then(( ) => {
                expect( moveSpy.calledOnce ).to.be.true;
                expect( moveSpy.calledWithExactly( GUID, data.parameters.destination, [ ])).to.be.true;
            });
        });

        it( 'should route to dataStore.move() with a GUID, a destination, and the -f flag', () => {
            const GUID = '2';
            const data = {
                action: 'move',
                parameters: {
                    destination: '3',
                    flags: ['f'],
                },
            };

            return index.PUT( GUID, userId, data )
            .then(( ) => {
                expect( moveSpy.calledOnce ).to.be.true;
                expect( moveSpy.calledWithExactly( GUID, data.parameters.destination, data.parameters.flags )).to.be.true;
            });
        });
    });

    describe( 'rename:', () => {
        it( 'should reject with 501/invalid parameters when parameters.name is missing', () => {
            const GUID = '2';
            const data = {
                action: 'rename',
                parameters: {
                    noName: 'noName',
                },
            };

            return expect( index.PUT( GUID, userId, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to dataStore.rename() with a GUID and name', () => {
            const GUID = '2';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'billyGoat.jpg',
                },
            };

            return index.PUT( GUID, userId, data )
            .then(( ) => {
                expect( renameSpy.calledOnce ).to.be.true;
                expect( renameSpy.calledWithExactly( GUID, data.parameters.name, [ ])).to.be.true;
            });
        });

        it( 'should route to dataStore.rename() with a GUID, a name, and the -f flag', () => {
            const GUID = '2';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'test.txt',
                    flags: ['f'],
                },
            };

            return index.PUT( GUID, userId, data )
            .then(( ) => {
                expect( renameSpy.calledOnce ).to.be.true;
                expect( renameSpy.calledWithExactly( GUID, data.parameters.name, data.parameters.flags )).to.be.true;
            });
        });
    });
});

describe( 'DELETE API', () => {
    describe( 'destroy:', () => {
        it( 'should route to dataStore.destroy() with a GUID', () => {
            const GUID = '2';

            return index.DELETE( GUID )
            .then(( ) => {
                expect( destroySpy.calledOnce ).to.be.true;
                expect( destroySpy.calledWithExactly( GUID )).to.be.true;
            });
        });
    });
});
