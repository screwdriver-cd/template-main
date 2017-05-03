'use strict';

const request = require('request-promise-native');
const fs = require('fs');
const URL = require('url');
const Yaml = require('js-yaml');

/**
 * Loads the yaml configuration from a file
 * @method loadYaml
 * @param  {String}     path        File path
 * @return {Promise}    Promise that resolves to the template as a config object
 */
function loadYaml(path) {
    return new Promise(resolve =>
        resolve(Yaml.safeLoad(fs.readFileSync(path, 'utf8'))));
}

/**
 * Validates the template yaml
 * @method validateTemplate
 * @param   {Object}        config          Template config
 * @return {Promise}         Resolves when template is valid/rejects when error or invalid
 */
function validateTemplate(config) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const url = URL.resolve(hostname, 'validator/template');

    return request({
        method: 'POST',
        url,
        auth: {
            bearer: process.env.SD_TOKEN
        },
        json: true,
        body: {
            yaml: JSON.stringify(config)
        }
    }).then((response) => {
        if (response.errors.length > 0) {
            let errorMessage = 'Template is not valid for the following reasons:';

            response.errors.forEach((err) => {
                /* eslint-disable prefer-template */
                errorMessage += `\n${JSON.stringify(err, null, 4)},`;
                /* eslint-enable prefer-template */
            });

            throw new Error(errorMessage);
        }

        return 'Template is valid';
    });
}

/**
 * Publishes the template yaml by posting to the SDAPI /templates endpoint
 * @method publishTemplate
 * @param   {Object}        config          Template config
 * @return {Promise}        Resolves if publish successfully
 */
function publishTemplate(config) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const url = URL.resolve(hostname, 'templates');

    return request({
        method: 'POST',
        url,
        auth: {
            bearer: process.env.SD_TOKEN
        },
        json: true,
        body: {
            yaml: JSON.stringify(config)
        },
        resolveWithFullResponse: true,
        simple: false
    }).then((response) => {
        const body = response.body;

        if (response.statusCode !== 201) {
            throw new Error('Error publishing template. ' +
            `${body.statusCode} (${body.error}): ${body.message}`);
        }

        return `Template ${body.name}@${body.version} was successfully published`;
    });
}

module.exports = {
    loadYaml,
    validateTemplate,
    publishTemplate
};
