'use strict';

const assert = require('chai').assert;
const path = require('path');
const sinon = require('sinon');
const mockery = require('mockery');

const TEST_YAML_FOLDER = path.resolve(__dirname, 'data');
const VALID_FULL_TEMPLATE_PATH = path.resolve(TEST_YAML_FOLDER, 'valid_template.yaml');

sinon.assert.expose(assert, {
    prefix: ''
});

describe('index test', () => {
    let validator;
    let requestMock;
    let mockResult;
    let mockRequest;
    // let stringifiedYaml;

    process.env.SD_TOKEN = 'blah';

    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        requestMock = sinon.stub();
        mockery.registerMock('request', requestMock);
        /* eslint-disable global-require */
        validator = require('../index');
        /* eslint-enable global-require */
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('uses the default path to validate a template', () => {
        // eslint-disable-next-line quotes, max-len
        // stringifiedYaml = 'name: template/main\nversion: 1.0.0\ndescription: Validates the template yaml\nmaintainer: tiffanykyi@gmail.com\nconfig:\n    image: node:6\n    steps:\n        - validate: node ./index.js';
        mockRequest = {
            auth: { bearer: 'blah' },
            body: {
                // eslint-disable-next-line quotes, max-len
                yaml: 'name: template/main\nversion: 1.0.0\ndescription: Validates the template yaml\nmaintainer: tiffanykyi@gmail.com\nconfig:\n    image: node:6\n    steps:\n        - validate: node ./index.js'.toString()
            },
            json: true,
            method: 'POST',
            url: 'https://api.screwdriver.cd/v4/validator/template'
        };
        mockResult = {
            statusCode: 200,
            body: {
                errors: [],
                template: {
                    name: 'template/main',
                    version: '1.0.0',
                    description: 'Validates the template yaml',
                    maintainer: 'tiffanykyi@gmail.com',
                    config: {
                        image: 'node:6',
                        steps: [
                            {
                                validate: 'node ./index.js'
                            }
                        ],
                        environment: {
                            LABELS: ['stable', 'latest']
                        }
                    }
                }
            }
        };
        requestMock.yieldsAsync(null, mockResult);

        return validator()
        .then((config) => {
            assert.calledWith(requestMock, mockRequest);
            assert.isObject(config);
            assert.deepEqual(config, mockResult);
        });
    });

    it('calls the API to validate a template', () => {
        mockResult = {
            statusCode: 200,
            body: {
                errors: [],
                template: {
                    name: 'tkyi/nodejs_main',
                    version: '2.0.1',
                    description: 'Template for a NodeJS main job.',
                    maintainer: 'tiffanykyi@gmail.com',
                    config: {
                        image: 'node:4',
                        steps: [
                            {
                                install: 'npm install'
                            },
                            {
                                test: 'npm test'
                            }
                        ],
                        environment: {
                            LABELS: ['stable', 'latest']
                        }
                    }
                }
            }
        };
        requestMock.yieldsAsync(null, mockResult);

        return validator(VALID_FULL_TEMPLATE_PATH)
        .then((config) => {
            assert.isObject(config);
            assert.deepEqual(config, mockResult);
        });
    });

    it('rejects with an error when the API call fails', () => {
        mockResult = new Error('You have failed.');
        requestMock.yieldsAsync(mockResult);

        return validator(VALID_FULL_TEMPLATE_PATH)
            .then(() => {
                assert.fail('you will never get dis');
            })
            .catch((err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.name, 'Error');
            });
    });
});
