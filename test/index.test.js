'use strict';

const assert = require('chai').assert;
const nock = require('nock');
const path = require('path');
const validator = require('../index');

const TEST_YAML_FOLDER = path.resolve(__dirname, 'data');
const VALID_FULL_TEMPLATE_PATH = path.resolve(TEST_YAML_FOLDER, 'valid_template.yaml');

describe('index test', () => {
    let mockResult;

    process.env.SD_TOKEN = 'blah';

    it('uses the default path to validate a template', () => {
        // eslint-disable-next-line quotes, max-len
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
        nock('https://api.screwdriver.cd')
            .post('/v4/validator/template')
            .reply(200, mockResult);

        return validator()
        .then((res) => {
            assert.isObject(res);
            assert.deepEqual(res, mockResult);
        });
    });

    it('calls the API to validate a template', () => {
        mockResult = {
            statusCode: 200,
            body: {
                errors: [],
                template: {
                    name: 'tkyi/nodejs_main_mock',
                    version: '2.0.1',
                    description: 'Mock template for a NodeJS main job.',
                    maintainer: 'mocker@gmail.com',
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
        nock('https://api.screwdriver.cd')
            .post('/v4/validator/template')
            .reply(200, mockResult);

        return validator(VALID_FULL_TEMPLATE_PATH)
        .then((res) => {
            assert.isObject(res);
            assert.deepEqual(res, mockResult);
        });
    });

    it('rejects with an error when the API call fails', () => {
        nock('https://api.screwdriver.cd')
            .post('/v4/validator/template')
            .replyWithError({
                message: 'something awful happened',
                code: '500'
            });

        return validator(VALID_FULL_TEMPLATE_PATH)
            .then(() => {
                assert.fail('you will never get dis');
            })
            .catch((err) => {
                assert.instanceOf(err, Error);
                assert.equal(err.name, 'TypeError');
            });
    });
});
