'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */

// TODO: add tests for normalized flags

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinon = require( 'sinon' );
const sinonchai = require( 'sinon-chai' );

// TODO: Swap out stub for ingested module
const index = require( '../src/index.js' );
const fsS3Mongo = require( '../src/fs-s3-mongo-stub.js' );

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
    readSpy = sinon.spy( fsS3Mongo, 'read' );
    searchSpy = sinon.spy( fsS3Mongo, 'search' );
    inspectSpy = sinon.spy( fsS3Mongo, 'inspect' );
    downloadSpy = sinon.spy( fsS3Mongo, 'download' );
    createSpy = sinon.spy( fsS3Mongo, 'create' );
    bulkSpy = sinon.spy( fsS3Mongo, 'bulk' );
    copySpy = sinon.spy( fsS3Mongo, 'copy' );
    updateSpy = sinon.spy( fsS3Mongo, 'update' );
    moveSpy = sinon.spy( fsS3Mongo, 'move' );
    renameSpy = sinon.spy( fsS3Mongo, 'rename' );
    destroySpy = sinon.spy( fsS3Mongo, 'destroy' );
});

const actions = [ 'read', 'search', 'inspect', 'download', 'create', 'bulk', 'copy', 'update', 'move', 'rename', 'destroy' ];
afterEach(() => {
    actions.forEach(( action ) => {
        fsS3Mongo[action].restore();
    });
});

describe( 'Top level routing', () => {
    it( 'should return a 404/invalid path or resource with an empty path', () => {
        const path = '';

        return expect( index.get( userID, path )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Invalid path or resource.',
            });
    });

    it( 'should return a 404/invalid path or resource with a null path', () => {
        const path = null;

        return expect( index.get( userID, path )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Invalid path or resource.',
            });
    });

    it( 'should return a 501/invalid action object when given an invalid action', () => {
        const path = 'valid/path/here/';
        const resource = 'test.txt';
        const data = {
            action: 'invalidAction',
        };

        return expect( index.get( userID, path + resource, data )).to.be.rejected
            .and.eventually.deep.equal({
                status: 501,
                message: 'Invalid action.',
            });
    });
});

describe( 'GET Actions: ', () => {
    describe( 'READ', () => {
        it( 'should route to fsS3Mongo.read() with non-empty path to a resource', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';

            index.get( userID, path + resource );

            expect( readSpy.calledOnce ).to.be.true;
            expect( readSpy.calledWithExactly( path )).to.be.true;
        });

        it( 'should route to fsS3Mongo.search() with non-empty path to a directory and no flags', () => {
            const path = 'valid/path/here/';

            index.get( userID, path );

            expect( readSpy.calledOnce ).to.be.true;
            expect( readSpy.calledWithExactly( path, '*', null )).to.be.true;
        });

        it( 'should route to fsS3Mongo.search() with non-empty path to a directory and pass the -r flag', () => {
            const path = 'valid/path/here/';
            const data = {
                parameters: {
                    flags: ['r'],
                },
            };

            index.get( userID, path, data );

            expect( searchSpy.calledOnce ).to.be.true;
            expect( searchSpy.calledWithExactly( path, '*', null, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'SEARCH', () => {
        it( 'should reject with 501/invalid parameters when parameters.query is missing', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'search',
                parameters: {
                    noQuery: '*',
                },
            };

            return expect( index.get( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should return a 415/invalid type object when given a resource instead of a directory', () => {
            const path = 'valid/path/here/';
            const resource = 'notADirectory.txt';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                },
            };

            return expect( index.get( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 415,
                    message: 'Invalid resource type.',
                });
        });

        it( 'should route to fsS3Mongo.search() with a directory path, a non-empty query, and no flags', () => {
            const path = 'valid/path/here/';
            const resource = 'folder/';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                },
            };

            index.get( userID, path + resource, data );

            expect( searchSpy.calledOnce ).to.be.true;
            expect( searchSpy.calledWithExactly( path + resource, data.parameters.query, null )).to.be.true;
        });

        it( 'should route to fsS3Mongo.search() with a directory path, a non-empty query and pass the -r flag', () => {
            const path = 'valid/path/here/';
            const resource = 'folder/';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                    flags: ['r'],
                },
            };

            index.get( userID, path + resource, data );

            expect( searchSpy.calledOnce ).to.be.true;
            expect( searchSpy.calledWithExactly( path + resource, data.parameters.query, null, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'INSPECT', () => {
        it( 'should return a 415/invalid type object when given a directory instead of a resource', () => {
            const path = 'valid/path/here/';
            const resource = 'directory/';
            const data = {
                action: 'inspect',
            };

            return expect( index.get( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 415,
                    message: 'Invalid resource type.',
                });
        });

        it( 'should route to fsS3Mongo.inspect() with a non-empty path to a resource', () => {
            const path = 'valid/path/here/';
            const resource = 'test.txt';
            const data = {
                action: 'inspect',
            };

            index.get( userID, path + resource, data );

            expect( inspectSpy.calledOnce ).to.be.true;
            expect( inspectSpy.calledWithExactly( path + resource )).to.be.true;
        });

        it( 'should route to fsS3Mongo.inspect() with a non-empty path to a resource, including any specified fields', () => {
            const path = 'valid/path/here/';
            const resource = 'test.txt';
            const data = {
                action: 'inspect',
                fields: [ 'name', 'parent' ],
            };

            index.get( userID, path + resource, data );

            expect( inspectSpy.calledOnce ).to.be.true;
            expect( inspectSpy.calledWithExactly( path + resource, data.fields )).to.be.true;
        });
    });

    describe( 'DOWNLOAD', () => {
        it( 'should route to fsS3Mongo.download() with a non-empty path to a resource', () => {
            const path = 'valid/path/here/';
            const resource = 'validFile.txt';
            const data = {
                action: 'download',
            };

            index.get( userID, path + resource, data );

            expect( downloadSpy.calledOnce ).to.be.true;
            expect( downloadSpy.calledWithExactly( path + resource, 'zip' )).to.be.true;
        });
    });
});

describe( 'POST Actions', () => {
    describe( 'CREATE', () => {
        it( 'should reject with 501/invalid parameters when parameters.content is missing', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    noContent: '',
                },
            };

            return expect( index.post( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.create() with a non-empty path to a resource and content, with no flags', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };

            index.post( userID, path + resource, data );

            expect( createSpy.calledOnce ).to.be.true;
            expect( createSpy.calledWithExactly( path + resource, data.parameters.content )).to.be.true;
        });

        it( 'should route to fsS3Mongo.create() with a non-empty path to a resource and content, and pass the -f flag', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                    flags: ['f'],
                },
            };

            index.post( userID, path + resource, data );

            expect( createSpy.calledOnce ).to.be.true;
            expect( createSpy.calledWithExactly( path + resource, data.parameters.content, data.parameters.flags )).to.be.true;
        });
    });

    // TODO: Add additional validation tests for bulk()
    describe( 'BULK', () => {
        it( 'should reject with 501/invalid parameters when parameters.resources is missing', () => {
            const path = 'valid/path/here/';
            const resource = 'uploadFolder/';
            const data = {
                action: 'bulk',
                parameters: {
                    noResources: [],
                },
            };

            return expect( index.post( 'POST', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.bulk() with a non-empty path to a resource, and an array of resources', () => {
            const path = 'valid/path/here/';
            const resource = 'uploadFolder/';
            const data = {
                action: 'bulk',
                parameters: {
                    resources: {
                        'another_cat_picture': 'raw image data',
                        'the_best_cats/': null,
                    },
                },
            };

            index.post( userID, path + resource, data );

            expect( bulkSpy.calledOnce ).to.be.true;
            expect( bulkSpy.calledWithExactly( path + resource, data.parameters.resources )).to.be.true;
        });

        it( 'should route to fsS3Mongo.bulk() with a non-empty path to a resource, an array of resources, and pass the -f flag', () => {
            const path = 'valid/path/here/';
            const resource = 'uploadFolder/';
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

            index.post( userID, path + resource, data );

            expect( bulkSpy.calledOnce ).to.be.true;
            expect( bulkSpy.calledWithExactly( path + resource, data.parameters.resources, data.parameters.flags )).to.be.true;
        });
    });

    // TODO: Add tests for the different flag combinations
    describe( 'COPY', () => {
        it( 'should reject with 501/invalid parameters when parameters.destination is missing', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    noDestination: [],
                },
            };

            return expect( index.post( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.copy() with a non-empty path to a resource and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };

            index.post( userID, path + resource, data );

            expect( copySpy.calledOnce ).to.be.true;
            expect( copySpy.calledWithExactly( path + resource, data.parameters.destination )).to.be.true;
        });

        it( 'should route to fsS3Mongo.copy() with a non-empty path to a resource, a destination, and pass the -u, -f, -r flags', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    destination: 'valid/path/there/',
                    flags: [ 'u', 'f', 'r' ],
                },
            };

            index.post( userID, path + resource, data );

            expect( copySpy.calledOnce ).to.be.true;
            expect( copySpy.calledWithExactly( path + resource, data.parameters.destination, data.parameters.flags )).to.be.true;
        });
    });
});

describe( 'PUT Actions', () => {
    describe( 'UPDATE', () => {
        it( 'should reject with 501/invalid parameters when parameters.content is missing', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    noContent: '',
                },
            };

            return expect( index.put( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.update() with a non-empty path to a resource, and content', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };

            index.put( userID, path + resource, data );

            expect( updateSpy.calledOnce ).to.be.true;
            expect( updateSpy.calledWithExactly( path + resource, data.parameters.contents )).to.be.true;
        });

        it( 'should route to fsS3Mongo.update() with a non-empty path to a resource, and content, and pass the -f flag', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                    flags: ['f'],
                },
            };

            index.put( userID, path + resource, data );

            expect( updateSpy.calledOnce ).to.be.true;
            expect( updateSpy.calledWithExactly( path + resource, data.parameters.contents, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'MOVE', () => {
        it( 'should reject with 501/invalid parameters when parameters.destination is missing', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    noDestination: 'not/here/',
                },
            };

            return expect( index.put( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.move() with a non-empty path to a resource, and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };

            index.put( userID, path + resource, data );

            expect( moveSpy.calledOnce ).to.be.true;
            expect( moveSpy.calledWithExactly( path + resource, data.parameters.destination )).to.be.true;
        });

        it( 'should route to fsS3Mongo.move() with a non-empty path to a resource, a destination, and passed the -f flag', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    destination: 'valid/path/there/',
                    flags: ['f'],
                },
            };

            index.put( userID, path + resource, data );

            expect( moveSpy.calledOnce ).to.be.true;
            expect( moveSpy.calledWithExactly( path + resource, data.parameters.destination, data.parameters.flags )).to.be.true;
        });
    });

    describe( 'RENAME', () => {
        it( 'should reject with 501/invalid parameters when parameters.name is missing', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    noName: 'noName',
                },
            };

            return expect( index.put( userID, path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to fsS3Mongo.rename() with a non-empty path to a resource, and name', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'billyGoat.jpg',
                },
            };

            index.put( userID, path + resource, data );

            expect( renameSpy.calledOnce ).to.be.true;
            expect( renameSpy.calledWithExactly( path + resource, data.parameters.name )).to.be.true;
        });

        it( 'should route to fsS3Mongo.rename() with a non-empty path to a resource, name, and passed the -f flag', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'billyGoat.jpg',
                    flags: ['f'],
                },
            };

            index.put( userID, path + resource, data );

            expect( renameSpy.calledOnce ).to.be.true;
            expect( renameSpy.calledWithExactly( path + resource, data.parameters.name, data.parameters.flags )).to.be.true;
        });
    });
});

describe( 'DELETE actions', () => {
    describe( 'DESTROY', () => {
        it( 'should route to fsS3Mongo.destroy() with a non-empty path to a resource', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';

            index.delete( userID, path + resource );

            expect( destroySpy.calledOnce ).to.be.true;
            expect( destroySpy.calledWithExactly( path + resource )).to.be.true;
        });
    });
});
