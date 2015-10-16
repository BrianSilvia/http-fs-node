'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0, func-names: 0 */

// TODO: figure out how to test multi-part form responses

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const getModule = require( '../../src/get.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'Module validation', () => {
    it( 'should return an INVALID_RESOURCE_PATH status string with an invalid path', () => {
        const path = 'invalid/path/here';
        const resource = 'validFile.txt';
        return expect( getModule.get( path, resource )).to.eventually.equal({
            status: 'INVALID_RESOURCE_PATH',
        });
    });

    it( 'should return an INVALID_RESOURCE status string with an invalid resource', () => {
        const path = 'valid/path/here';
        const resource = 'invalidFile.txt';

        return expect( getModule.get( path, resource )).to.eventually.equal({
            status: 'INVALID_RESOURCE',
        });
    });

    it( 'should return an INVALID_FILE_TYPE status string with an invalid resource', () => {
        const path = 'valid/path/here';
        const resource = 'validFile.txt';
        const query = '*';

        return expect( getModule.search( path, resource, query )).to.eventually.equal({
            status: 'INVALID_RESOUCE_TYPE',
        });
    });

    it( 'should return a SUCCESSFUL status string with a valid path and valid resource', () => {
        const path = 'valid/path/here';
        const resource = 'goat.jpg';

        return expect( getModule.get( path, resource )).to.eventually.have.property( 'status', 'SUCCESSFUL' );
    });
});

describe( 'GET action (default)', () => {
    it( 'should return raw image data with a valid path and image resource', () => {
        const path = 'valid/path/here';
        const resource = 'goat.jpg';

        return expect( getModule.get( path, resource )).to.eventually.have.property( 'data' );
    });

    it( 'should return raw text data with a valid path and text resource', () => {
        const path = 'valid/path/here';
        const resource = 'test.txt';

        return expect( getModule.get( path, resource )).to.eventually.have.property( 'data' );
    });

    it( 'should return an array of resource names with a valid path and folder resource', () => {
        const path = 'valid/path/here';
        const resource = 'validFolderName/';

        return expect( getModule.get( path, resource )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array );
    });
});

describe( 'SEARCH action', () => {
    it( 'should return an array of matching resource names from that path', () => {
        const path = 'valid/path/here';
        const resource = 'validFolderName/';
        const query = '*';

        // TODO: specify number of files
        const numFiles = 4;

        return expect( getModule.search( path, resource, query )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( numFiles );
    });

    it( 'should return an empty array when nothing matches from that path', () => {
        const path = 'valid/path/here';
        const resource = 'validFolderName/';
        const query = 'will-not-match';

        return expect( getModule.search( path, resource, query )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( 0 );
    });

    it( 'should return a sorted array of matching resource names from that path based on sorting passed', () => {
        const path = 'valid/path/here';
        const resource = 'validFolderName/';
        const query = '*';
        const sorting = 'alphabetical';

        // TODO: specify number of files
        const numFiles = 4;
        const fileNames = [ 'a-file.txt', 'b-file.txt', 'c-file.txt', 'd-file.txt' ];

        return expect( getModule.search( path, resource, query, sorting )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( numFiles ).and.equal( fileNames );
    });

    it( 'should return an array of deep matching resource names from that path with the recursive flag', () => {
        const path = 'valid/path/here';
        const resource = 'validFolderName/';
        const query = '*';
        const sorting = 'default';
        const recursive = true;

        // TODO: specify number of files
        const numFiles = 4;
        const fileNames = [ 'a-file.txt', 'b-file.txt', 'c-file.txt', 'd-file.txt', 'foldername/deeperFile.txt' ];

        return expect( getModule.search( path, resource, query, sorting, recursive )).to.eventually.have.property( 'data' )
            .to.be.instanceof( Array ).and.have.length( numFiles ).and.equal( fileNames );
    });
});

describe( 'INSPECT action', () => {
    it( 'should return an object containing all metadata by default', () => {
        const path = 'valid/path/here';
        const resource = 'test.txt';

        // TODO: specify expected metadata
        const result = {
            type: 'file',
            size: 1234567890,
            name: 'test.txt',
            parent: 'valid/path/here',
            dateCreated: '1122334455667788900',
            lastModified: '1122334455667788900',
        };

        return expect( getModule.inspect( path, resource )).to.eventually.have.property( 'data' )
            .to.equal( result );
    });

    it( 'should return an object containing the specified fields', () => {
        const path = 'valid/path/here';
        const resource = 'test.txt';
        const files = [ 'type', 'name', 'parent' ];

        // TODO: specify expected metadata
        const result = {
            type: 'file',
            name: 'test.txt',
            parent: 'valid/path/here',
        };

        return expect( getModule.inspect( path, resource, files )).to.eventually.have.property( 'data' )
            .to.equal( result );
    });

    it( 'should return an object containing the specified fields and drop any invalid fields', () => {
        const path = 'valid/path/here';
        const resource = 'test.txt';
        const files = [ 'type', 'name', 'parent', 'invalid1', 'invalid2' ];

        // TODO: specify expected metadata
        const result = {
            type: 'file',
            name: 'test.txt',
            parent: 'valid/path/here',
        };

        return expect( getModule.inspect( path, resource, files )).to.eventually.have.property( 'data' )
            .to.equal( result );
    });
});

describe( 'DOWNLOAD action', () => {
    it( 'should return zipped resource contents with a valid path and resource', () => {
        const path = 'valid/path/here';
        const resource = 'validFile.txt';

        return expect( getModule.download( path, resource )).to.eventually.have.property( 'data' );
    });
});
