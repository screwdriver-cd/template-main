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

        return {
            valid: true
        };
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
            `${response.statusCode} (${body.error}): ${body.message}`);
        }

        return {
            name: body.name,
            version: body.version
        };
    });
}

/**
 * Removes all versions of a template by sending a delete request to the SDAPI /templates/{name} endpoint
 * @method removeTemplate
 * @param  {String}        name         The template name
 * @return {Promise}       Resolves if removed successfully
 */
function removeTemplate(name) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const url = URL.resolve(hostname, `templates/${name}`);

    return request({
        method: 'DELETE',
        url,
        auth: {
            bearer: process.env.SD_TOKEN
        },
        json: true,
        resolveWithFullResponse: true,
        simple: false
    }).then((response) => {
        const { body } = response;

        if (response.statusCode !== 204) {
            throw new Error(`Error removing template ${name}. ` +
            `${response.statusCode} (${body.error}): ${body.message}`);
        }

        return { name };
    });
}

/**
 * Tags a specific template version by posting to the SDAPI /templates/templateName/tag endpoint
 * @method tagTemplate
 * @param  {Object}    config
 * @param  {String}    config.name    Template name
 * @param  {String}    config.tag     Template tag
 * @param  {String}    config.version Template version
 * @return {Promise}                  Resolves if tagged successfully
 */
function tagTemplate({ name, tag, version }) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const templateName = encodeURIComponent(name);
    const templateTag = encodeURIComponent(tag);
    const url = URL.resolve(hostname, `templates/${templateName}/tags/${templateTag}`);

    return request({
        method: 'PUT',
        url,
        auth: {
            bearer: process.env.SD_TOKEN
        },
        json: true,
        body: {
            version
        },
        resolveWithFullResponse: true,
        simple: false
    }).then((response) => {
        const body = response.body;

        if (response.statusCode !== 201 && response.statusCode !== 200) {
            throw new Error('Error tagging template. ' +
            `${response.statusCode} (${body.error}): ${body.message}`);
        }

        return {
            name,
            tag,
            version
        };
    });
}

module.exports = {
    loadYaml,
    validateTemplate,
    publishTemplate,
    removeTemplate,
    tagTemplate
};
