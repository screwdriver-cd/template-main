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
 * @return {Request}         Request object from post call to SDAPI
 */
function validateTemplate() {
    let i;
    let errorMessage;

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

    return request(params, (err, response, body) => {
        if (err) {
            throw new Error(`Error sending validate request: ${err}`);
        } else if (body.errors.length > 0) {
            errorMessage = 'Template is not valid for the following reasons:';
            for (i = 0; i < body.errors.length; i += 1) {
                /* eslint-disable prefer-template */
                errorMessage += `\n ${JSON.stringify(body.errors[i], null, 3)}`;
                /* eslint-enable prefer-template */
            }

            throw new Error(errorMessage);
        } else {
            console.log('Template is valid.');
        }
    }).headers;
}

module.exports = {
    publishTemplate,
    validateTemplate
};
