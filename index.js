'use strict';

const request = require('request-promise');
const fs = require('fs');
const Yaml = require('js-yaml');

/**
 * Publishes the template yaml by posting to the SDAPI /templates endpoint
 * @method publishTemplate
 * @return {null}
 */
function publishTemplate() {
    const path = process.env.SD_TEMPLATE_PATH || './sd-template.yaml';
    const yaml = Yaml.safeLoad(fs.readFileSync(path, 'utf8'));
    const params = {
        body: yaml,
        json: true,
        auth: {
            bearer: process.env.SD_TOKEN
        },
        method: 'POST',
        url: 'https://api.screwdriver.cd/v4/templates',
        resolveWithFullResponse: true,
        simple: false
    };

    return request(params)
        .then((response) => {
            const body = response.body;

            if (response.statusCode !== 201) {
                throw new Error('Template was not published. ' +
                `${body.statusCode} (${body.error}): ${body.message}`);
            }

            return Promise.resolve('Template successfully published.');
        })
        .catch(err => Promise.reject(err.message));
}

/**
 * Validates the template yaml by posting to the SDAPI /validator/template endpoint
 * @method validateTemplate
 * @return {Promise}         Resolves when template is valid/rejects when error or invalid
 */
function validateTemplate() {
    const path = process.env.SD_TEMPLATE_PATH || './sd-template.yaml';
    const json = JSON.stringify(Yaml.safeLoad(fs.readFileSync(path, 'utf8')));
    const params = {
        body: {
            yaml: json
        },
        json: true,
        auth: {
            bearer: process.env.SD_TOKEN
        },
        method: 'POST',
        url: 'https://api.screwdriver.cd/v4/validator/template'
    };

    return request(params)
        .then((response) => {
            if (response.errors.length > 0) {
                let errorMessage = 'Template is not valid for the following reasons:';

                response.errors.forEach((err) => {
                    /* eslint-disable prefer-template */
                    errorMessage += `\n ${JSON.stringify(err, null, 3)}`;
                    /* eslint-enable prefer-template */
                });

                throw new Error(errorMessage);
            }

            return Promise.resolve('Template is valid.');
        })
        .catch(err => Promise.reject(err.message));
}

module.exports = {
    publishTemplate,
    validateTemplate
};
