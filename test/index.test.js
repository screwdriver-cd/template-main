'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');
const fs = require('fs');

describe('Templates', () => {
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

    after(() => {
        mockery.disable();
    });

    beforeEach(() => {
        requestMock = sinon.stub();
        YamlMock = {
            safeLoad: sinon.stub()
        };
        fsMock = {
            readFileSync: sinon.stub()
        };

        mockery.registerMock('fs', fsMock);
        mockery.registerMock('request-promise', requestMock);
        mockery.registerMock('js-yaml', YamlMock);

        /* eslint-disable global-require */
        index = require('../index');
        /* eslint-enable global-require */
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
        index = null;
    });

    describe('Template Publish', () => {
        beforeEach(() => {
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
        });

        it('throws error when request yields an error', () => {
            requestMock.rejects(new Error('error'));

            return index.publishTemplate()
                .then(() => assert.fail('should not get here'))
                .catch(err => assert.equal(err, 'error'));
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

            requestMock.resolves(responseFake);

            return index.publishTemplate()
                .then(() => assert.fail('should not get here'))
                .catch(err => assert.equal(err,
                    'Template was not published. 403 (Forbidden): Fake forbidden message'));
        });

        it('succeeds and does not throw an error if request status code is 201', () => {
            const responseFake = {
                statusCode: 201,
                body: yamlReturn
            };

            requestMock.resolves(responseFake);

            return index.publishTemplate()
                .then(msg => assert.equal(msg, 'Template successfully published.'));
        });
    });

    describe('Template Validate', () => {
        it('throws error when request yields an error', () => {
            requestMock.rejects(new Error('error'));

            return index.validateTemplate()
                .then(() => assert.fail('should not get here'))
                .catch(err => assert.equal(err, 'error'));
        });

        it('throws corresponding request errors if response includes errors', () => {
            yamlReturn = {
                name: 'template/test',
                version: '1.0.0',
                doesntexist: 'bad',
                description: 'Publishes the template yaml from sd-template.yaml',
                maintainer: 'tiffanykyi@gmail.com',
                config: {
                    image: 'node:6'
                }
            };

            YamlMock.safeLoad.returns(yamlReturn);

            const responseFake = {
                errors: [
                    {
                        message: '"steps" is required',
                        path: 'config.steps',
                        type: 'any.required',
                        context: {
                            key: 'steps'
                        }
                    },
                    {
                        message: '"doesntexist" is not allowed',
                        path: 'doesntexist',
                        type: 'object.allowUnknown',
                        context: {
                            child: 'doesntexist',
                            key: 'doesntexist'
                        }
                    }
                ],
                template: yamlReturn
            };

            requestMock.resolves(responseFake);

            return index.validateTemplate()
                .then(() => assert.fail('should not get here'))
                .catch((err) => {
                    assert.equal(
                        err,
                        fs.readFileSync('./test/data/template_invalid.txt').toString()
                    );
                });
        });

        it('succeeds and does not throw an error if response includes no errors', () => {
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

            const responseFake = {
                errors: [],
                template: yamlReturn
            };

            requestMock.resolves(responseFake);

            return index.validateTemplate()
                .then(msg => assert.equal(msg, 'Template is valid.'));
        });
    });
});
