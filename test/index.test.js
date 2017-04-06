'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('Template Publish', () => {
    let requestMock;
    let YamlMock;
    let fsMock;
    let index;
    let yamlReturn;

    before(() => {
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
    });

    beforeEach(() => {
        requestMock = sinon.stub();
        YamlMock = {
            safeLoad: sinon.stub()
        };
        fsMock = {
            readFileSync: sinon.stub()
        };
        yamlReturn = {
            name: 'template/test',
            version: '1.0.0',
            description: 'Publishes the template yaml from sd-template.yaml',
            maintainer: 'tiffanykyi@gmail.com',
            config: {
                image: 'node:6',
                steps: [
                    { publish: 'node ./publish.js' }
                ]
            }
        };

        YamlMock.safeLoad.returns(yamlReturn);

        mockery.registerMock('fs', fsMock);
        mockery.registerMock('js-yaml', YamlMock);
        mockery.registerMock('request', requestMock);

        /* eslint-disable global-require */
        index = require('../index');
        /* eslint-enable global-require */
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
        index = null;
    });

    after(() => {
        mockery.disable();
    });

    it('throws error when request yields an error', () => {
        const error = new Error('error');

        requestMock.yields(error);
        assert.throws(index.publishTemplate, Error, 'Error sending request: Error: error');
    });

    it('throws error for the corresponding request error status code if not 201', () => {
        const responseFake = {
            statusCode: 403,
            body: {
                statusCode: 403,
                error: 'Forbidden',
                message: 'Fake forbidden message'
            }
        };

        requestMock.yields(null, responseFake, responseFake.body);
        assert.throws(index.publishTemplate, Error,
            'Template was not published. 403 (Forbidden): Fake forbidden message');
    });

    it('succeeds and does not throw an error if request status code is 201', () => {
        const responseFake = {
            statusCode: 201,
            body: yamlReturn
        };

        requestMock.yields(null, responseFake, responseFake.body);
        assert.doesNotThrow(index.publishTemplate);
    });
});
