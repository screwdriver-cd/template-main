'use strict';

const fs = require('fs');
const URL = require('url');
const request = require('screwdriver-request');
const Yaml = require('js-yaml');

/**
 * Loads the yaml configuration from a file
 * @method loadYaml
 * @param  {String}     path        File path
 * @return {Promise}    Promise that resolves to the template as a config object
 */
function loadYaml(path) {
    return new Promise(resolve => {
        resolve(Yaml.load(fs.readFileSync(path, 'utf8')));
    });
}

// eslint-disable-next-line require-jsdoc
function validateTemplate(config, apiURL) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const url = URL.resolve(hostname, apiURL);

    return request({
        method: 'POST',
        url,
        context: {
            token: process.env.SD_TOKEN
        },
        json: {
            yaml: JSON.stringify(config)
        }
    }).then(response => {
        const { body } = response;

        if (body.errors.length > 0) {
            let errorMessage = 'Template is not valid for the following reasons:';

            body.errors.forEach(err => {
                errorMessage += `\n${JSON.stringify(err, null, 4)},`;
            });

            throw new Error(errorMessage);
        }

        return {
            valid: true
        };
    });
}

// eslint-disable-next-line require-jsdoc
function validateJobTemplate(config) {
    return validateTemplate(config, 'validator/template');
}

// eslint-disable-next-line require-jsdoc
function validatePipelineTemplate(config) {
    return validateTemplate(config, 'validator/pipelineTemplate');
}

/**
 * Publishes the template yaml by posting to the SDAPI /templates endpoint
 * @method publishTemplate
 * @param  {Object}         config          Template config
 * @return {Promise}        Resolves if publish successfully
 */
function publishTemplate(config) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const url = URL.resolve(hostname, 'templates');

    return request({
        method: 'POST',
        url,
        context: {
            token: process.env.SD_TOKEN
        },
        json: {
            yaml: JSON.stringify(config)
        }
    }).then(response => {
        const { body } = response;

        if (response.statusCode !== 201) {
            throw new Error(`Error publishing template. ${response.statusCode} (${body.error}): ${body.message}`);
        }

        let fullTemplateName = body.name;

        // Figure out template name
        if (body.namespace && body.namespace !== 'default') {
            fullTemplateName = `${body.namespace}/${body.name}`;
        }

        return {
            name: fullTemplateName,
            version: body.version
        };
    });
}

/**
 * Removes all versions of a template by sending a delete request to the SDAPI /templates/{name} endpoint
 * @method removeTemplate
 * @param  {String}        name         The full template name
 * @return {Promise}       Resolves if removed successfully
 */
function removeTemplate(name) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const templateName = encodeURIComponent(name);
    const url = URL.resolve(hostname, `templates/${templateName}`);

    return request({
        method: 'DELETE',
        url,
        context: {
            token: process.env.SD_TOKEN
        }
    }).then(response => {
        const { body } = response;

        if (response.statusCode !== 204) {
            throw new Error(`Error removing template ${name}. ${response.statusCode} (${body.error}): ${body.message}`);
        }

        return { name };
    });
}

/**
 * Removes specified version of a template by sending a delete request to the SDAPI /templates/{name}/versions/{version} endpoint
 * @method removeTemplate
 * @param  {Object}    config
 * @param  {String}    config.name    Template name
 * @param  {String}    config.version Template version to be removed
 * @return {Promise}                  Resolves if removed successfully
 */
function removeVersion({ name, version }) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const templateName = encodeURIComponent(name);
    const templateVersion = encodeURIComponent(version);
    const url = URL.resolve(hostname, `templates/${templateName}/versions/${templateVersion}`);

    return request({
        method: 'DELETE',
        url,
        context: {
            token: process.env.SD_TOKEN
        }
    }).then(response => {
        const { body } = response;

        if (response.statusCode !== 204) {
            throw new Error(
                `Error removing version ${version} of template ${name}. ${response.statusCode} (${body.error}): ${body.message}`
            );
        }

        return { name, version };
    });
}

/**
 * Helper function that returns the latest version for a template
 * @method getLatestVersion
 * @param  {String}         name        Template name
 * @return {Promise}        Resolves to latest version
 */
function getLatestVersion(name) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const templateName = encodeURIComponent(name);
    const url = URL.resolve(hostname, `templates/${templateName}`);

    return request({
        method: 'GET',
        url,
        context: {
            token: process.env.SD_TOKEN
        }
    }).then(response => {
        const { body, statusCode } = response;

        if (statusCode !== 200) {
            throw new Error(`Error getting latest template version. ${statusCode} (${body.error}): ${body.message}`);
        }

        return body[0].version;
    });
}

/**
 * Helper function that returns the version from a tag
 * @method getVersionFromTag
 * @param  {String}         name        Template name
 * @param  {String}         tag         Tag to fetch version from
 * @return {Promise}        Resolves the version from given tag
 */
function getVersionFromTag({ name, tag }) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const templateName = encodeURIComponent(name);
    const templateTag = encodeURIComponent(tag);
    const url = URL.resolve(hostname, `templates/${templateName}/${templateTag}`);

    return request({
        method: 'GET',
        url,
        context: {
            token: process.env.SD_TOKEN
        }
    }).then(response => {
        const { body, statusCode } = response;

        if (statusCode !== 200) {
            throw new Error(`Error getting version from tag. ${statusCode} (${body.error}): ${body.message}`);
        }

        return body.version;
    });
}

/**
 * Tags a specific template version by posting to the SDAPI /templates/{templateName}/tags/{tagName} endpoint
 * @method tagTemplate
 * @param  {Object}    config
 * @param  {String}    config.name       Template name
 * @param  {String}    config.tag        Template tag
 * @param  {String}    [config.version]  Template version
 * @return {Promise}                     Resolves if tagged successfully
 */
function tagTemplate({ name, tag, version }) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const templateName = encodeURIComponent(name);
    const templateTag = encodeURIComponent(tag);
    const url = URL.resolve(hostname, `templates/${templateName}/tags/${templateTag}`);

    if (!version) {
        return getLatestVersion(name).then(latest => tagTemplate({ name, tag, version: latest }));
    }

    return request({
        method: 'PUT',
        url,
        context: {
            token: process.env.SD_TOKEN
        },
        json: {
            version
        }
    }).then(response => {
        const { body, statusCode } = response;

        if (statusCode !== 201 && statusCode !== 200) {
            throw new Error(`Error tagging template. ${statusCode} (${body.error}): ${body.message}`);
        }

        return {
            name,
            tag,
            version
        };
    });
}

/**
 * Removes a template tag by sending a delete request to the SDAPI /templates/{templateName}/tags/{tagName} endpoint
 * @method removeTag
 * @param  {Object}    config
 * @param  {String}    config.name    Template name
 * @param  {String}    config.tag     Template tag
 * @return {Promise}                  Resolves if tagged successfully
 */
function removeTag({ name, tag }) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const templateName = encodeURIComponent(name);
    const templateTag = encodeURIComponent(tag);
    const url = URL.resolve(hostname, `templates/${templateName}/tags/${templateTag}`);

    return request({
        method: 'DELETE',
        url,
        context: {
            token: process.env.SD_TOKEN
        }
    }).then(response => {
        const { body, statusCode } = response;

        if (statusCode !== 204) {
            throw new Error(`Error removing template tag. ${statusCode} (${body.error}): ${body.message}`);
        }

        return {
            name,
            tag
        };
    });
}

// eslint-disable-next-line require-jsdoc
function publishPipelineTemplate(config) {
    const hostname = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';
    const url = URL.resolve(hostname, '/pipeline/template/publish');

    return request({
        method: 'POST',
        url,
        context: {
            token: process.env.SD_TOKEN
        },
        json: {
            yaml: JSON.stringify(config)
        }
    }).then(response => {
        const { body } = response;

        if (response.statusCode !== 201) {
            throw new Error(`Error publishing template. ${response.statusCode} (${body.error}): ${body.message}`);
        }

        return {
            name: body.name,
            version: body.version
        };
    });
}

module.exports = {
    loadYaml,
    validateJobTemplate,
    publishTemplate,
    removeTemplate,
    removeVersion,
    tagTemplate,
    removeTag,
    getVersionFromTag,
    validatePipelineTemplate,
    publishPipelineTemplate
};
