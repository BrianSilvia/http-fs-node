'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0, func-names: 0 */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const modules = require( '../../src/method.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'GET action (default)', () => {
    it( 'should return raw image data with a valid path and image resource', () => {
        const path = 'valid/path/here/';
        const resource = 'goat.jpg';

        // TODO: figure out how to test multi-part form responses
        return expect( modules.handleRequest( 'GET', path + resource )).to.eventually.have.property( 'data' );
    });

    it( 'should return raw text data with a valid path and text resource', () => {
        const path = 'valid/path/here/';
        const resource = 'test.txt';

        // TODO: figure out how to test multi-part form responses
        return expect( modules.handleRequest( 'GET', path + resource )).to.eventually.have.property( 'data' );
    });

    it( 'should return an array of resource names with a valid path and folder resource', () => {
        const path = 'valid/path/here/';
        const resource = 'validFolderName/';

        return expect( modules.handleRequest( 'GET', path + resource )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array );
    });
});

describe( 'SEARCH action', () => {
    it( 'should return an array of matching resource names from that path', () => {
        const path = 'valid/path/here/';
        const resource = 'validFolderName/';
        const data = {
            action: 'search',
            parameters: {
                query: '*',
            },
        };

        // TODO: specify number of files
        const numFiles = 4;

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( numFiles );
    });

    it( 'should return an empty array when nothing matches from that path', () => {
        const path = 'valid/path/here/';
        const resource = 'validFolderName/';
        const data = {
            action: 'search',
            parameters: {
                query: 'will-not-match',
            },
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( 0 );
    });

    it( 'should return a sorted array of matching resource names from that path based on sorting passed', () => {
        const path = 'valid/path/here/';
        const resource = 'validFolderName/';
        const data = {
            action: 'search',
            parameters: {
                query: '*',
                sorting: 'alphabetical',
            },
        };

        // TODO: specify number of files
        const numFiles = 4;
        const fileNames = [ 'a-file.txt', 'b-file.txt', 'c-file.txt', 'd-file.txt' ];

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( numFiles ).and.equal( fileNames );
    });

    it( 'should return an array of deep matching resource names from that path with the recursive flag', () => {
        const path = 'valid/path/here/';
        const resource = 'validFolderName/';
        const data = {
            action: 'search',
            parameters: {
                query: '*',
                flags: [ 'recursive' ],
            },
        };

        // TODO: specify number of files
        const numFiles = 4;
        const fileNames = [ 'a-file.txt', 'b-file.txt', 'c-file.txt', 'd-file.txt', 'foldername/deeperFile.txt' ];

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( numFiles ).and.equal( fileNames );
    });
});

describe( 'INSPECT action', () => {
    it( 'should return an object containing all metadata by default', () => {
        const path = 'valid/path/here/';
        const resource = 'test.txt';
        const data = {
            action: 'inspect',
        };

        // TODO: specify expected metadata
        const result = {
            type: 'file',
            size: 1234567890,
            name: 'test.txt',
            parent: 'valid/path/here/',
            dateCreated: '1122334455667788900',
            lastModified: '1122334455667788900',
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.eventually.have.property( 'data' )
            .to.equal( result );
    });

    it( 'should return an object containing the specified fields', () => {
        const path = 'valid/path/here/';
        const resource = 'test.txt';
        const data = {
            action: 'inspect',
            parameters: {
                files: [ 'type', 'name', 'parent' ],
            },
        };

        const result = {
            type: 'file',
            name: 'test.txt',
            parent: 'valid/path/here/',
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.eventually.have.property( 'data' )
            .to.equal( result );
    });

    it( 'should return an object containing the specified fields and drop any invalid fields', () => {
        const path = 'valid/path/here/';
        const resource = 'test.txt';
        const data = {
            action: 'inspect',
            parameters: {
                files: [ 'type', 'name', 'parent', 'invalid1', 'invalid2' ],
            },
        };

        const result = {
            type: 'file',
            name: 'test.txt',
            parent: 'valid/path/here/',
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.eventually.have.property( 'data' )
            .to.equal( result );
    });
});

describe( 'DOWNLOAD action', () => {
    it( 'should return zipped resource contents with a valid path and resource', () => {
        const path = 'valid/path/here/';
        const resource = 'validFile.txt';

        return expect( modules.handleRequest( 'GET', path + resource )).to.eventually.have.property( 'data' );
    });
});
