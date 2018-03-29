'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

sinon.assert.expose(assert, { prefix: '' });

describe('index', () => {
    let requestMock;
    let YamlMock;
    let fsMock;
    let index;
    let templateConfig;

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
        templateConfig = {
            name: 'template/test',
            version: '1.0.0',
            description: 'test description',
            maintainer: 'foo@bar.com',
            config: {
                image: 'node:6',
                steps: [
                    { publish: 'node ./test.js' }
                ]
            }
        };

        YamlMock.safeLoad.returns(templateConfig);

        mockery.registerMock('fs', fsMock);
        mockery.registerMock('js-yaml', YamlMock);
        mockery.registerMock('request-promise-native', requestMock);

        // eslint-disable-next-line global-require
        index = require('../index');
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
        index = null;
    });

    after(() => {
        mockery.disable();
    });

    describe('Load Yaml', () => {
        it('resolves if loads successfully', () => {
            YamlMock.safeLoad.resolves('yamlcontent');

            return index.loadYaml(config => assert.equal(config, 'yamlcontent'));
        });
    });

    describe('Template Validate', () => {
        it('throws error when request yields an error', () => {
            requestMock.rejects(new Error('error'));

            return index.validateTemplate(templateConfig)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                        assert.equal(err.message, 'error');
                    });
        });

        it('throws error if response template is invalid', () => {
            const responseFake = {
                errors: [{
                    message: '"steps" is required',
                    path: 'config.steps',
                    type: 'any.required',
                    context: {
                        key: 'steps'
                    }
                }],
                template: {}
            };

            requestMock.resolves(responseFake);

            return index.validateTemplate(templateConfig)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                        // eslint-disable-next-line max-len
                        assert.equal(err.message, 'Template is not valid for the following reasons:\n' +
                    '{\n    "message": "\\"steps\\" is required",\n    "path": "config.steps",' +
                    '\n    "type": "any.required",' +
                    '\n    "context": {\n        "key": "steps"\n    }\n},');
                    });
        });

        it('resolves if template is valid', () => {
            const responseFake = {
                errors: [],
                template: templateConfig
            };

            requestMock.resolves(responseFake);

            return index.validateTemplate(templateConfig)
                .then(result => assert.deepEqual(result, {
                    valid: true
                }));
        });
    });

    describe('Template Publish', () => {
        it('throws error when request yields an error', () => {
            requestMock.rejects(new Error('error'));

            return index.publishTemplate(templateConfig)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                        assert.equal(err.message, 'error');
                    });
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

            return index.publishTemplate(templateConfig)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                        assert.equal(err.message,
                            'Error publishing template. 403 (Forbidden): Fake forbidden message');
                    });
        });

        it('succeeds and does not throw an error if request status code is 201', () => {
            const responseFake = {
                statusCode: 201,
                body: templateConfig
            };

            requestMock.resolves(responseFake);

            return index.publishTemplate(templateConfig)
                .then(result => assert.deepEqual(result, {
                    name: templateConfig.name,
                    version: templateConfig.version
                }));
        });
    });

    describe('Template Remove', () => {
        it('throws error when request yields an error', () => {
            requestMock.rejects(new Error('error'));

            return index.removeTemplate(templateConfig.name)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                        assert.equal(err.message, 'error');
                    });
        });

        it('throws error for the corresponding request error status code if not 204', () => {
            const responseFake = {
                statusCode: 403,
                body: {
                    statusCode: 403,
                    error: 'Forbidden',
                    message: 'Fake forbidden message'
                }
            };

            requestMock.resolves(responseFake);

            return index.removeTemplate(templateConfig.name)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                    // eslint-disable-next-line max-len
                        const msg = 'Error removing template template/test. 403 (Forbidden): Fake forbidden message';

                        assert.equal(err.message, msg);
                    });
        });

        it('succeeds and does not throw an error if request status code is 204', () => {
            const responseFake = {
                statusCode: 204
            };

            requestMock.resolves(responseFake);

            return index.removeTemplate(templateConfig.name)
                .then(result => assert.deepEqual(result, { name: templateConfig.name }));
        });
    });
    describe('Template Tag', () => {
        const url = `${process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/'}` +
            'templates/template%2Ftest/tags/stable';
        const config = {
            name: 'template/test',
            tag: 'stable',
            version: '1.0.0'
        };

        it('throws error when request yields an error', () => {
            requestMock.rejects(new Error('error'));

            return index.tagTemplate(config)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                        assert.equal(err.message, 'error');
                    });
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

            return index.tagTemplate(config)
                .then(() => assert.fail('should not get here'),
                    (err) => {
                        assert.equal(err.message,
                            'Error tagging template. 403 (Forbidden): Fake forbidden message');
                    });
        });

        it('succeeds and does not throw an error if request status code is 201', () => {
            const responseFake = {
                statusCode: 201,
                body: templateConfig
            };

            requestMock.resolves(responseFake);

            return index.tagTemplate(config)
                .then((result) => {
                    assert.deepEqual(result, {
                        name: config.name,
                        tag: config.tag,
                        version: config.version
                    });
                    assert.calledWith(requestMock, {
                        method: 'PUT',
                        url,
                        auth: {
                            bearer: process.env.SD_TOKEN
                        },
                        json: true,
                        body: {
                            version: '1.0.0'
                        },
                        resolveWithFullResponse: true,
                        simple: false
                    });
                });
        });

        it('succeeds and does not throw an error if request status code is 200', () => {
            const responseFake = {
                statusCode: 200,
                body: templateConfig
            };

            requestMock.resolves(responseFake);

            return index.tagTemplate(config)
                .then((result) => {
                    assert.deepEqual(result, {
                        name: config.name,
                        version: config.version,
                        tag: config.tag
                    });
                    assert.calledWith(requestMock, {
                        method: 'PUT',
                        url,
                        auth: {
                            bearer: process.env.SD_TOKEN
                        },
                        json: true,
                        body: {
                            version: '1.0.0'
                        },
                        resolveWithFullResponse: true,
                        simple: false
                    });
                });
        });
    });
});
