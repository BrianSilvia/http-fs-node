/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0, func-names: 0 */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );
// const sinon = require( 'sinon' );
const get = require( '../../src/get.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'homepage', function() {
    it( 'should respond be true', function() {
        expect( true ).to.be.true;
    });

    it( 'should equal 3, cause', function() {
        return expect( get()).to.eventually.equal( 3 );
    });
});
