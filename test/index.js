'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */

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

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'GET Actions', () => {
    describe( 'READ', () => {
        it( 'should route to get.read() with a valid path+resource', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';
            const spy = sinon.spy( get, 'read' );

            index.handleRequest( 'GET', path + resource );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource )).to.be.true;

            get.read.restore();
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

        it( 'should route to get.search() with a valid path+resource and query', () => {
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
    });

    describe( 'INSPECT', () => {
        it( 'should route to get.inspect() with a valid path+resource', () => {
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

        it( 'should route to get.inspect() with a valid path+resource including any specified fields', () => {
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
    });

    describe( 'DOWNLOAD', () => {
        it( 'should route to get.download() with a valid path+resource', () => {
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

        it( 'should route to post.create() with a valid path+resource and content', () => {
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

        it( 'should route to post.bulk() with a valid path+resource and resources', () => {
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

        it( 'should route to post.copy() with a valid path+resource and destination', () => {
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

        it( 'should route to put.update() with a valid path+resource and content', () => {
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

        it( 'should route to put.move() with a valid path+resource and destination', () => {
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

        it( 'should route to put.rename() with a valid path+resource and destination', () => {
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
    });
});

describe( 'DELETE actions', () => {
    describe( 'DESTROY', () => {
        it( 'should route to destroy.destroy() with a valid path+resource', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';

            const spy = sinon.spy( destroy, 'destroy' );

            index.handleRequest( 'DELETE', path + resource );

            expect( spy.calledOnce ).to.be.true;
            expect( spy.calledWithExactly( path + resource )).to.be.true;
        });
    });
});

describe( 'Top level routing', () => {
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
