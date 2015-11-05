'use strict';

/* eslint-env mocha */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const modules = require( '../src/method.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'General module validation', () => {
    it( 'should return a 404/does not exist object when given an invalid path', () => {
        const path = 'invalid/path/here/';
        const resource = 'validFile.txt';

        return expect( modules.handleRequest( 'GET', path + resource )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Resource does not exist.',
            });
    });

    it( 'should return a 404/invalid path object when given an invalid resource', () => {
        const path = 'valid/path/here/';
        const resource = 'invalidFile.txt';

        return expect( modules.handleRequest( 'GET', path + resource )).to.be.rejected
            .and.eventually.deep.equal({
                status: 404,
                message: 'Invalid path.',
            });
    });

    it( 'should return a 415/invalid type object when given an invalid resource type', () => {
        const path = 'valid/path/here/';
        const resource = 'notADirectory.txt';
        const data = {
            action: 'search',
            parameters: {
                query: '*',
            },
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.be.rejected
            .and.eventually.deep.equal({
                status: 415,
                message: 'Invalid resource type.',
            });
    });

    it( 'should return a 501/invalid action object when given an invalid action', () => {
        const path = 'valid/path/here/';
        const resource = 'test.txt';
        const data = {
            action: 'invalidAction',
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.be.rejected
            .and.eventually.deep.equal({
                status: 501,
                message: 'Invalid action.',
            });
    });

    it( 'should return a 501/invalid parameters object when given an invalid set of parameters', () => {
        const path = 'valid/path/here/';
        const resource = 'validDirectory/';
        const data = {
            action: 'search',
            parameters: {
                queryWrong: '*',
            },
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.be.rejected
            .and.eventually.deep.equal({
                status: 501,
                message: 'Invalid parameters.',
            });
    });

    it( 'should pass validation when given an appropriate path and resource', () => {
        const path = 'valid/path/here/';
        const resource = 'validDirectory/';
        const data = {
            action: 'search',
            parameters: {
                query: '*',
            },
        };

        return expect( modules.handleRequest( 'GET', path + resource, data )).to.be.fulfilled
            .and.eventually.have.property( 'data' )
            .to.be.instanceof( Array );
    });
});
