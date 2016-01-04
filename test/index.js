'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */

// TODO: fix wrapping-already-wrapped functions
// TODO: add tests for normalized flags
// TODO: update fsS3Mongo functions with correct params

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinon = require( 'sinon' );
const sinonchai = require( 'sinon-chai' );

const index = require( '../src/index.js' );
const get = require( '../src/get.js' );
const post = require( '../src/post.js' );
const put = require( '../src/put.js' );
const destroy = require( '../src/delete.js' );

// TODO: require module when it's ingested instead of this
const fsS3Mongo = {
    read: function read() {},
    search: function search() {},
    inspect: function inspect() {},
    write: function write() {},
    update: function update() {},
    move: function move() {},
    rename: function rename() {},
    copy: function copy() {},
    _destroy: function _destroy() {},
};

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'GET Actions: ', () => {
    describe( 'READ', () => {
        it( 'should route to index.read() with a valid path', () => {
            const path = 'valid/path/here/';
            const spy = sinon.spy( get, 'read' );

            index.handleRequest( 'GET', path );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path )).to.be.true;

            get.read.restore();
        });

        it( 'should ultimately route to fsS3Mongo.read() with a valid path', () => {
            const path = 'valid/path/here/';
            const spy = sinon.spy( fsS3Mongo, 'read' );

            index.handleRequest( 'GET', path );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path )).to.be.true;

            fsS3Mongo.read.restore();
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

            return expect( index.handleRequest( 'GET', path + resource, data )).to.be.rejected
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

            return expect( index.handleRequest( 'GET', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 415,
                    message: 'Invalid resource type.',
                });
        });

        it( 'should route to get.search() with a valid path, resource and query parameter', () => {
            const path = 'valid/path/here/';
            const resource = 'folder/';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                },
            };
            const spy = sinon.spy( get, 'search' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            get.search.restore();
        });

        it( 'should ultimately route to fsS3Mongo.search() with a valid path, resource and query parameter', () => {
            const path = 'valid/path/here/';
            const resource = 'folder/';
            const data = {
                action: 'search',
                parameters: {
                    query: '*',
                },
            };
            const spy = sinon.spy( fsS3Mongo, 'search' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            fsS3Mongo.search.restore();
        });
    });

    describe( 'INSPECT', () => {
        it( 'should route to get.inspect() with a valid path and resource', () => {
            const path = 'valid/path/here/';
            const resource = 'test.txt';
            const data = {
                action: 'inspect',
            };
            const spy = sinon.spy( get, 'inspect' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            get.inspect.restore();
        });

        it( 'should route to get.inspect() with a valid path and resource including any specified fields', () => {
            const path = 'valid/path/here/';
            const resource = 'test.txt';
            const data = {
                action: 'inspect',
                fields: [ 'name', 'parent' ],
            };
            const spy = sinon.spy( get, 'inspect' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            get.inspect.restore();
        });

        it( 'should ultimately route to fsS3Mongo.inspect() with a valid path and resource', () => {
            const path = 'valid/path/here/';
            const resource = 'test.txt';
            const data = {
                action: 'inspect',
            };
            const spy = sinon.spy( fsS3Mongo, 'inspect' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, '*' )).to.be.true;

            fsS3Mongo.inspect.restore();
        });

        it( 'should ultimately route to fsS3Mongo.inspect() with a valid path and resource including any specified fields', () => {
            const path = 'valid/path/here/';
            const resource = 'test.txt';
            const data = {
                action: 'inspect',
                fields: [ 'name', 'parent' ],
            };
            const spy = sinon.spy( fsS3Mongo, 'inspect' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data.fields )).to.be.true;

            fsS3Mongo.inspect.restore();
        });
    });

    describe( 'DOWNLOAD', () => {
        it( 'should route to get.download() with a valid path and resource', () => {
            const path = 'valid/path/here/';
            const resource = 'validFile.txt';
            const data = {
                action: 'download',
            };
            const spy = sinon.spy( get, 'download' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource )).to.be.true;

            get.download.restore();
        });

        it( 'should ultimately route to fsS3Mongo.read() with a valid path and resource, and compression flag', () => {
            const path = 'valid/path/here/';
            const resource = 'validFile.txt';
            const data = {
                action: 'download',
            };
            const spy = sinon.spy( fsS3Mongo, 'read' );

            index.handleRequest( 'GET', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, 'zip' )).to.be.true;

            fsS3Mongo.read.restore();
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

            return expect( index.handleRequest( 'POST', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to post.create() with a valid path and resource, and content', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };
            const spy = sinon.spy( post, 'create' );

            index.handleRequest( 'POST', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            post.create.restore();
        });

        it( 'should ultimately route to fsS3Mongo.create() with a valid path and resource, and content', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };
            const spy = sinon.spy( fsS3Mongo, 'write' );

            index.handleRequest( 'POST', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data.parameters.content )).to.be.true;

            fsS3Mongo.write.restore();
        });
    });

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

            return expect( index.handleRequest( 'POST', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to post.bulk() with a valid path and resource, and resources', () => {
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
            const spy = sinon.spy( post, 'bulk' );

            index.handleRequest( 'POST', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            post.bulk.restore();
        });

        // TODO: Add additional validation tests for bulk()

        it( 'should ultimately route to fsS3Mongo.write() with a valid path and resource, and resources', () => {
            const path = 'valid/path/here/';
            const resource = 'uploadFolder/';
            const data = {
                action: 'bulk',
                parameters: {
                    resources: {
                        'another_cat_picture': 'raw image data',
                    },
                },
            };
            const spy = sinon.spy( fsS3Mongo, 'write' );

            index.handleRequest( 'POST', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, { 'another_cat_picture': 'raw image data' })).to.be.true;

            fsS3Mongo.write.restore();
        });

        it( 'should call into fsS3Mongo.write() once per resource, with a valid path and resource, and resources', () => {
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
            const spy = sinon.spy( fsS3Mongo, 'write' );

            index.handleRequest( 'POST', path + resource, data );

            expect( spy.calledTwice ).to.be.true;
            expect( spy[0].calledWithExactly( path + resource, { 'another_cat_picture': 'raw image data' })).to.be.true;
            expect( spy[1].calledWithExactly( path + resource, { 'the_best_cats/': null })).to.be.true;

            fsS3Mongo.write.restore();
        });
    });

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

            return expect( index.handleRequest( 'POST', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to post.copy() with a valid path and resource, and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };
            const spy = sinon.spy( post, 'copy' );

            index.handleRequest( 'POST', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            post.copy.restore();
        });

        it( 'should ultimately route to fsS3Mongo.copy() with a valid path and resource, and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'copy',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };
            const spy = sinon.spy( fsS3Mongo, 'copy' );

            index.handleRequest( 'POST', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data.parameters.destination )).to.be.true;

            fsS3Mongo.copy.restore();
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

            return expect( index.handleRequest( 'PUT', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to put.update() with a valid path and resource, and content', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };
            const spy = sinon.spy( put, 'update' );

            index.handleRequest( 'PUT', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            put.update.restore();
        });

        it( 'should ultimately route to fsS3Mongo.update() with a valid path and resource, and content', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                parameters: {
                    content: 'this content string',
                },
            };
            const spy = sinon.spy( fsS3Mongo, 'update' );

            index.handleRequest( 'PUT', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data.parameters.content )).to.be.true;

            fsS3Mongo.update.restore();
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

            return expect( index.handleRequest( 'PUT', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to put.move() with a valid path and resource, and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };
            const spy = sinon.spy( put, 'move' );

            index.handleRequest( 'PUT', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            put.move.restore();
        });

        it( 'should ultimately route to fsS3Mongo.move() with a valid path and resource, and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'move',
                parameters: {
                    destination: 'valid/path/there/',
                },
            };
            const spy = sinon.spy( fsS3Mongo, 'move' );

            index.handleRequest( 'PUT', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data.parameters.destination )).to.be.true;

            fsS3Mongo.move.restore();
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

            return expect( index.handleRequest( 'PUT', path + resource, data )).to.be.rejected
                .and.eventually.deep.equal({
                    status: 501,
                    message: 'Invalid parameters.',
                });
        });

        it( 'should route to put.rename() with a valid path and resource, and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'billyGoat.jpg',
                },
            };
            const spy = sinon.spy( put, 'rename' );

            index.handleRequest( 'PUT', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data )).to.be.true;

            put.rename.restore();
        });

        it( 'should ultimately route to fsS3Mongo.rename() with a valid path and resource, and destination', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const data = {
                action: 'rename',
                parameters: {
                    name: 'billyGoat.jpg',
                },
            };
            const spy = sinon.spy( fsS3Mongo, 'rename' );

            index.handleRequest( 'PUT', path + resource, data );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource, data.parameters.name )).to.be.true;

            fsS3Mongo.rename.restore();
        });
    });
});

describe( 'DELETE actions', () => {
    describe( 'DESTROY', () => {
        it( 'should route to destroy.destroy() with a valid path and resource', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';

            const spy = sinon.spy( destroy, 'destroy' );

            index.handleRequest( 'DELETE', path + resource );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource )).to.be.true;

            destroy.destroy.restore();
        });

        it( 'should ultimately route to fsS3Mongo.destroy() with a valid path and resource', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';

            const spy = sinon.spy( fsS3Mongo, '_destroy' );

            index.handleRequest( 'DELETE', path + resource );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource )).to.be.true;

            fsS3Mongo._destroy.restore();
        });
    });
});

describe( 'Top level routing', () => {
    it( 'should return a 404/invalid path or resource with an empty path', () => {
        const path = '';

        index.handleRequest( 'GET', path );

        return expect( index.handleRequest( 'GET', path )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Invalid path or resource.',
            });
    });

    it( 'should return a 404/invalid path or resource with a null path', () => {
        const path = null;

        index.handleRequest( 'GET', path );

        return expect( index.handleRequest( 'GET', path )).to.be.rejected
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

        return expect( index.handleRequest( 'GET', path + resource, data )).to.be.rejected
            .and.eventually.deep.equal({
                status: 501,
                message: 'Invalid action.',
            });
    });
});
