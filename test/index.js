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

const userID = '12345';

// Declare spies here to prevent rewrapping them
let readSpy;
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

const actions = [ 'read', 'search', 'inspect', 'download', 'create', 'bulk', 'copy', 'update', 'move', 'rename', 'destroy' ];
afterEach(() => {
    actions.forEach(( action ) => {
        index.dataStore[action].restore();
    });
});

describe( 'Top level routing', () => {
    it( 'should reject with a 404/resource not found error, with an empty path', () => {
        const path = '';

        return expect( index.GET( userID, path )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Resource not found.',
            });
    });

    it( 'should reject with a 501/invalid action object when given an invalid action', () => {
        const path = 'valid/path/here/';
        const file = 'test.txt';
        const data = {
            action: 'invalidAction',
        };

        return expect( index.GET( userID, path + file, data )).to.be.rejected
            .and.eventually.deep.equal({
                status: 501,
                message: 'Invalid action.',
            });
    });
});

describe( 'GET API', () => {
    describe( 'read:', () => {
        it( 'should route to fsS3Mongo.read() with non-empty path to a file', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';

            index.GET( userID, path + file );

            expect( readSpy.calledOnce ).to.be.true;
            expect( readSpy.calledWithExactly( path + file, userID )).to.be.true;
        });

        it( 'should route to fsS3Mongo.search() with non-empty path to a folder and no flags', () => {
            const path = 'valid/path/here/';

            index.GET( userID, path );

            expect( searchSpy.calledOnce ).to.be.true;
            expect( searchSpy.calledWithExactly( path, userID, '*', null, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.search() with non-empty path to a folder and pass the -r flag', () => {
            const path = 'valid/path/here/';
            const data = {
                parameters: {
                    flags: ['r'],
                },
            };

            index.GET( userID, path, data );

            expect( searchSpy.calledOnce ).to.be.true;
            expect( searchSpy.calledWithExactly( path, userID, '*', null, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'search:', () => {
        it( 'should reject with 501/invalid parameters when parameters.query is missing', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'search',
                parameters: {
                    noQuery: '*',
                },
            };

            return expect( index.GET( userID, path + file, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should reject a 415/invalid type object when given a file instead of a folder', () => {
            const path = 'valid/path/here/';
            const file = 'notAfolder.txt';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                },
            };

            return expect( index.GET( userID, path + file, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 415,
                    message: 'Invalid resource type.',
                });
        });

        it( 'should route to fsS3Mongo.search() with a folder, a non-empty query, and no flags', () => {
            const path = 'valid/path/here/';
            const folder = 'folder/';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                },
            };

            index.GET( userID, path + folder, data );

            expect( searchSpy.calledOnce ).to.be.true;
            expect( searchSpy.calledWithExactly( path + folder, userID, data.parameters.query, null, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.search() with a folder a non-empty query and pass the -r flag', () => {
            const path = 'valid/path/here/';
            const folder = 'folder/';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                    flags: ['r'],
                },
            };

            index.GET( userID, path + folder, data );

            expect( searchSpy.calledOnce ).to.be.true;
            expect( searchSpy.calledWithExactly( path + folder, userID, data.parameters.query, null, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'inspect:', () => {
        it( 'should reject with a 415/invalid type object when given a folder instead of a file', () => {
            const path = 'valid/path/here/';
            const folder = 'folder/';
            const data = {
                action: 'inspect',
            };

            return expect( index.GET( userID, path + folder, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 415,
                    message: 'Invalid resource type.',
                });
        });

        it( 'should route to fsS3Mongo.inspect() with a non-empty path to a file', () => {
            const path = 'valid/path/here/';
            const file = 'test.txt';
            const data = {
                action: 'inspect',
            };

            index.GET( userID, path + file, data );

            expect( inspectSpy.calledOnce ).to.be.true;
            expect( inspectSpy.calledWithExactly( path + file, userID, null )).to.be.true;
        });

        it( 'should route to fsS3Mongo.inspect() with a non-empty path to a file, including any specified fields', () => {
            const path = 'valid/path/here/';
            const file = 'test.txt';
            const data = {
                action: 'inspect',
                parameters: {
                    fields: [ 'name', 'parent' ],
                },
            };

            index.GET( userID, path + file, data );

            expect( inspectSpy.calledOnce ).to.be.true;
            expect( inspectSpy.calledWithExactly( path + file, userID, data.parameters.fields )).to.be.true;
        });
    });

    describe( 'download:', () => {
        it( 'should route to fsS3Mongo.download() with a non-empty path to a file', () => {
            const path = 'valid/path/here/';
            const file = 'validFile.txt';
            const data = {
                action: 'download',
            };

            index.GET( userID, path + file, data );

            expect( downloadSpy.calledOnce ).to.be.true;
            expect( downloadSpy.calledWithExactly( path + file, userID, 'zip' )).to.be.true;
        });

        it( 'should route to fsS3Mongo.download() with a non-empty path to a folder', () => {
            const path = 'valid/path/here/';
            const folder = 'folder/';
            const data = {
                action: 'download',
            };

            index.GET( userID, path + folder, data );

            expect( downloadSpy.calledOnce ).to.be.true;
            expect( downloadSpy.calledWithExactly( path + folder, userID, 'zip' )).to.be.true;
        });
    });
});

describe( 'POST API', () => {
    describe( 'create:', () => {
        it( 'should reject with 501/invalid parameters when parameters.content is missing', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                parameters: {
                    noContent: '',
                },
            };

            return expect( index.POST( userID, path + file, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.create() with a non-empty path to a file and content, with no flags', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };

            index.POST( userID, path + file, data );

            expect( createSpy.calledOnce ).to.be.true;
            expect( createSpy.calledWithExactly( path + file, userID, data.parameters.content, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.create() with a non-empty path to a file and content, and pass the -f flag', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                    flags: ['f'],
                },
            };

            index.POST( userID, path + file, data );

            expect( createSpy.calledOnce ).to.be.true;
            expect( createSpy.calledWithExactly( path + file, userID, data.parameters.content, data.parameters.flags )).to.be.true;
        });
    });

    // TODO: Add additional validation tests for bulk()
    describe( 'bulk:', () => {
        it( 'should reject with 501/invalid parameters when parameters.resources is missing', () => {
            const path = 'valid/path/here/';
            const folder = 'uploadFolder/';
            const data = {
                action: 'bulk',
                parameters: {
                    noResources: [],
                },
            };

            return expect( index.POST( userID, path + folder, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.bulk() with a non-empty path to a folder, and an array of resources', () => {
            const path = 'valid/path/here/';
            const folder = 'uploadFolder/';
            const data = {
                action: 'bulk',
                parameters: {
                    resources: {
                        'another_cat_picture': 'raw image data',
                        'the_best_cats/': null,
                    },
                },
            };

            index.POST( userID, path + folder, data );

            expect( bulkSpy.calledOnce ).to.be.true;
            expect( bulkSpy.calledWithExactly( path + folder, userID, data.parameters.resources, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.bulk() with a non-empty path to a folder, an array of resources, and pass the -f flag', () => {
            const path = 'valid/path/here/';
            const folder = 'uploadFolder/';
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

            index.POST( userID, path + folder, data );

            expect( bulkSpy.calledOnce ).to.be.true;
            expect( bulkSpy.calledWithExactly( path + folder, userID, data.parameters.resources, data.parameters.flags )).to.be.true;
        });
    });

    // TODO: Add tests for the different flag combinations
    describe( 'copy:', () => {
        it( 'should reject with 501/invalid parameters when parameters.destination is missing', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    noDestination: [],
                },
            };

            return expect( index.POST( userID, path + file, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.copy() with a non-empty path to a file and destination', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };

            index.POST( userID, path + file, data );

            expect( copySpy.calledOnce ).to.be.true;
            expect( copySpy.calledWithExactly( path + file, userID, data.parameters.destination, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.copy() with a non-empty path to a file, a destination, and pass the -u, and -f flags', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    destination: 'valid/path/there/',
                    flags: [ 'u', 'f' ],
                },
            };

            index.POST( userID, path + file, data );

            expect( copySpy.calledOnce ).to.be.true;
            expect( copySpy.calledWithExactly( path + file, userID, data.parameters.destination, data.parameters.flags )).to.be.true;
        });
    });
});

describe( 'PUT API', () => {
    describe( 'update:', () => {
        it( 'should reject with 501/invalid parameters when parameters.content is missing', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                parameters: {
                    noContent: '',
                },
            };

            return expect( index.PUT( userID, path + file, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should reject with a 415/invalid type object when given a folder instead of a file', () => {
            const path = 'valid/path/here/';
            const folder = 'folder/';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };

            return expect( index.PUT( userID, path + folder, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 415,
                    message: 'Invalid resource type.',
                });
        });

        it( 'should route to fsS3Mongo.update() with a non-empty path to a file, and content', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };

            index.PUT( userID, path + file, data );

            expect( updateSpy.calledOnce ).to.be.true;
            expect( updateSpy.calledWithExactly( path + file, userID, data.parameters.content, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.update() with a non-empty path to a file, and content, and pass the -f flag', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                    flags: ['f'],
                },
            };

            index.PUT( userID, path + file, data );

            expect( updateSpy.calledOnce ).to.be.true;
            expect( updateSpy.calledWithExactly( path + file, userID, data.parameters.content, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'move:', () => {
        it( 'should reject with 501/invalid parameters when parameters.destination is missing', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    noDestination: 'not/here/',
                },
            };

            return expect( index.PUT( userID, path + file, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.move() with a non-empty path to a file, and destination', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };

            index.PUT( userID, path + file, data );

            expect( moveSpy.calledOnce ).to.be.true;
            expect( moveSpy.calledWithExactly( path + file, userID, data.parameters.destination, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.move() with a non-empty path to a file, a destination, and passed the -f flag', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    destination: 'valid/path/there/',
                    flags: ['f'],
                },
            };

            index.PUT( userID, path + file, data );

            expect( moveSpy.calledOnce ).to.be.true;
            expect( moveSpy.calledWithExactly( path + file, userID, data.parameters.destination, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'rename:', () => {
        it( 'should reject with 501/invalid parameters when parameters.name is missing', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    noName: 'noName',
                },
            };

            return expect( index.PUT( userID, path + file, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.rename() with a non-empty path to a file, and name', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'billyGoat.jpg',
                },
            };

            index.PUT( userID, path + file, data );

            expect( renameSpy.calledOnce ).to.be.true;
            expect( renameSpy.calledWithExactly( path + file, userID, data.parameters.name, [ ])).to.be.true;
        });

        it( 'should route to fsS3Mongo.rename() with a non-empty path to a file, name, and passed the -f flag', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'billyGoat.jpg',
                    flags: ['f'],
                },
            };

            index.PUT( userID, path + file, data );

            expect( renameSpy.calledOnce ).to.be.true;
            expect( renameSpy.calledWithExactly( path + file, userID, data.parameters.name, data.parameters.flags )).to.be.true;
        });
    });
});

describe( 'DELETE API', () => {
    describe( 'destroy:', () => {
        it( 'should route to fsS3Mongo.destroy() with a non-empty path to a file', () => {
            const path = 'valid/path/here/';
            const file = 'goat.jpg';

            index.DELETE( userID, path + file );

            expect( destroySpy.calledOnce ).to.be.true;
            expect( destroySpy.calledWithExactly( path + file, userID )).to.be.true;
        });

        it( 'should route to fsS3Mongo.destroy() with a non-empty path to a folder', () => {
            const path = 'valid/path/here/';
            const folder = 'folder/';

            index.DELETE( userID, path + folder );

            expect( destroySpy.calledOnce ).to.be.true;
            expect( destroySpy.calledWithExactly( path + folder, userID )).to.be.true;
        });
    });
});
