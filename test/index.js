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
const dataStore = require( './mocks/fs-s3-mongo-stub.js' );
const permissions = require( './mocks/brinkbit-permissions-stub.js' );
const index = require( '../src/index.js' )({ dataStore, permissions });

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
    readSpy = sinon.spy( dataStore, 'read' );
    aliasSpy = sinon.spy( dataStore, 'alias' );
    searchSpy = sinon.spy( dataStore, 'search' );
    inspectSpy = sinon.spy( dataStore, 'inspect' );
    downloadSpy = sinon.spy( dataStore, 'download' );
    createSpy = sinon.spy( dataStore, 'create' );
    bulkSpy = sinon.spy( dataStore, 'bulk' );
    copySpy = sinon.spy( dataStore, 'copy' );
    updateSpy = sinon.spy( dataStore, 'update' );
    moveSpy = sinon.spy( dataStore, 'move' );
    renameSpy = sinon.spy( dataStore, 'rename' );
    destroySpy = sinon.spy( dataStore, 'destroy' );
});

const actions = [ 'read', 'alias', 'search', 'inspect', 'download', 'create', 'bulk', 'copy', 'update', 'move', 'rename', 'destroy' ];
afterEach(() => {
    actions.forEach( action => {
        dataStore[action].restore();
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

        return expect( index.GET( GUID, userId, null )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Resource does not exist.',
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

            return index.GET( GUID, userId, null )
            .then(( ) => {
                expect( readSpy ).to.have.been.calledOnce;
                expect( readSpy ).to.have.been.calledWithExactly( GUID, [ ]);
            });
        });
    });

    describe( 'alias:', () => {
        it( 'should route to dataStore.alias() with a fullPath', () => {
            const fullPath = '/valid/path/here/test.txt';
            const data = {
                action: 'alias',
                rootId: '1234567',
            };

            return index.GET( fullPath, userId, data )
            .then(( ) => {
                expect( aliasSpy ).to.have.been.calledOnce;
                expect( aliasSpy ).to.have.been.calledWithExactly( fullPath, data );
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
                expect( searchSpy ).to.have.been.calledOnce;
                expect( searchSpy ).to.have.been.calledWithExactly( GUID, data.parameters.query, null, [ ]);
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
                expect( searchSpy ).to.have.been.calledOnce;
                expect( searchSpy ).to.have.been.calledWithExactly( GUID, data.parameters.query, null, data.parameters.flags );
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
                expect( searchSpy ).to.have.been.calledOnce;
                expect( searchSpy ).to.have.been.calledWithExactly( GUID, data.parameters.query, data.parameters.sort, data.parameters.flags );
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
                expect( inspectSpy ).to.have.been.calledOnce;
                expect( inspectSpy ).to.have.been.calledWithExactly( GUID, null );
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
                expect( inspectSpy ).to.have.been.calledOnce;
                expect( inspectSpy ).to.have.been.calledWithExactly( GUID, data.parameters.fields );
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
                expect( downloadSpy ).to.have.been.calledOnce;
                expect( downloadSpy ).to.have.been.calledWithExactly( GUID, 'zip' );
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
                expect( createSpy ).to.have.been.calledOnce;
                expect( createSpy ).to.have.been.calledWithExactly( GUID, params.type, params.name, params.content, [ ]);
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
                expect( createSpy ).to.have.been.calledOnce;
                expect( createSpy ).to.have.been.calledWithExactly( GUID, params.type, params.name, params.content, data.parameters.flags );
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
                expect( createSpy ).to.have.been.calledOnce;
                expect( createSpy ).to.have.been.calledWithExactly( GUID, params.type, params.name, undefined, [ ]);
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
                expect( bulkSpy ).to.have.been.calledOnce;
                expect( bulkSpy ).to.have.been.calledWithExactly( GUID, data.parameters.resources, [ ]);
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
                expect( bulkSpy ).to.have.been.calledOnce;
                expect( bulkSpy ).to.have.been.calledWithExactly( GUID, data.parameters.resources, data.parameters.flags );
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
                expect( copySpy ).to.have.been.calledOnce;
                expect( copySpy ).to.have.been.calledWithExactly( GUID, data.parameters.destination, [ ]);
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
                expect( copySpy ).to.have.been.calledOnce;
                expect( copySpy ).to.have.been.calledWithExactly( GUID, data.parameters.destination, data.parameters.flags );
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
                expect( updateSpy ).to.have.been.calledOnce;
                expect( updateSpy ).to.have.been.calledWithExactly( GUID, data.parameters.content, [ ]);
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
                expect( updateSpy ).to.have.been.calledOnce;
                expect( updateSpy ).to.have.been.calledWithExactly( GUID, data.parameters.content, data.parameters.flags );
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
                expect( moveSpy ).to.have.been.calledOnce;
                expect( moveSpy ).to.have.been.calledWithExactly( GUID, data.parameters.destination, [ ]);
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
                expect( renameSpy ).to.have.been.calledOnce;
                expect( renameSpy ).to.have.been.calledWithExactly( GUID, data.parameters.name, [ ]);
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
                expect( renameSpy ).to.have.been.calledOnce;
                expect( renameSpy ).to.have.been.calledWithExactly( GUID, data.parameters.name, data.parameters.flags );
            });
        });
    });
});

describe( 'DELETE API', () => {
    describe( 'destroy:', () => {
        it( 'should route to dataStore.destroy() with a GUID', () => {
            const GUID = '2';

            return index.DELETE( GUID, null, null )
            .then(( ) => {
                expect( destroySpy ).to.have.been.calledOnce;
                expect( destroySpy ).to.have.been.calledWithExactly( GUID );
            });
        });
    });
});
