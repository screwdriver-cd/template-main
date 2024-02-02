'use strict';

const fs = require('fs');
const URL = require('url');
const request = require('screwdriver-request');
const Yaml = require('js-yaml');

const SD_API_URL = process.env.SD_API_URL || 'https://api.screwdriver.cd/v4/';

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

/**
 * Validates the jobs and pipeline template yaml by posting to the endpoint
 * @method validateTemplate
 * @param  {Object}         config          Template config
 * @param  {String}         apiURL          endpoint API
 * @return {Promise}        Resolves if validates successfully
 */
function validateTemplate(config, apiURL) {
    const hostname = SD_API_URL;
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

/**
 * Validates the job template yaml by using the validateTemplate method and passing the API endpoint
 * @method validateJobTemplate
 * @param  {Object}         config          Template config
 * @return {Promise}        Resolves if validates successfully
 */
function validateJobTemplate(config) {
    return validateTemplate(config, 'validator/template');
}

/**
 * Validates the pipeline template yaml by using the validateTemplate method and passing the API endpoint
 * @method validatePipelineTemplate
 * @param  {Object}         config          Template config
 * @return {Promise}        Resolves if validates successfully
 */
function validatePipelineTemplate(config) {
    return validateTemplate(config, 'pipeline/template/validate');
}

/**
 * Publishes the jobs and pipeline template yaml by posting to the endpoint
 * @method publishTemplate
 * @param  {Object}         config          Template config
 * @param  {String}         apiURL          endpoint API
 * @return {Promise}        Resolves if publishes successfully
 */
function publishTemplate(config, apiURL) {
    const hostname = SD_API_URL;
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

        if (response.statusCode !== 201) {
            throw new Error(`Error publishing template. ${response.statusCode} (${body.error}): ${body.message}`);
        }

        return body;
    });
}

/**
 * Publishes the job template yaml by using the publishTemplate method and passing the API endpoint
 * @method publishJobTemplate
 * @param  {Object}         config          Template config
 * @return {Promise}        Resolves if publishes successfully
 */
function publishJobTemplate(config) {
    return publishTemplate(config, 'templates').then(template => {
        let fullTemplateName = template.name;

        // Figure out template name
        if (template.namespace && template.namespace !== 'default') {
            fullTemplateName = `${template.namespace}/${template.name}`;
        }

        return {
            name: fullTemplateName,
            version: template.version
        };
    });
}

/**
 * Publishes the pipeline template yaml by using the publishTemplate method and passing the API endpoint
 * @method publishPipelineTemplate
 * @param  {Object}         config          Template config
 * @return {Promise}        Resolves if publishes successfully
 */
async function publishPipelineTemplate(config) {
    const template = await publishTemplate(config, 'pipeline/template');

    return {
        namespace: template.namespace,
        name: template.name,
        version: template.version
    };
}

/**
 * Removes a template.
 * @param {Object} config - The config for removing the template.
 * @param {string} config.path - The path of the template.
 * @param {string} config.name - The name of the template.
 * @returns {Promise<Object>} A promise that resolves to an object containing the name of the removed template.
 * @throws {Error} If there is an error removing the template.
 */
function removeTemplate({ path, name }) {
    const hostname = SD_API_URL;
    const url = URL.resolve(hostname, path);

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
 * Removes specified version of a template by sending a delete request to the SDAPI endpoint
 * @method removeVersion
 * @param  {Object}    config
 * @param  {string}     config.path - The path of the template.
 * @param  {String}    config.name    Template name
 * @param  {String}    config.version Template version to be removed
 * @return {Promise}                  Resolves if removed successfully
 */
function removeVersion({ path, name, version }) {
    const hostname = SD_API_URL;
    const url = URL.resolve(hostname, path);

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
    const hostname = SD_API_URL;
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
 * @param  {String}         path        The API path
 * @param  {String}         name        Template name
 * @param  {String}         tag         Tag to fetch version from
 * @return {Promise}        Resolves the version from given tag
 */
function getVersionFromTag({ path, name, tag }) {
    const hostname = SD_API_URL;
    const url = URL.resolve(hostname, path);

    return request({
        method: 'GET',
        url,
        context: {
            token: process.env.SD_TOKEN
        }
    }).then(response => {
        const { body, statusCode } = response;

        if (statusCode !== 200) {
            throw new Error(
                `Error getting version from ${name} tag ${tag}. ${statusCode} (${body.error}): ${body.message}`
            );
        }

        return body.version;
    });
}

/**
 * Tags a specific template version by posting to the SDAPI endpoint
 * @method tagTemplate
 * @param  {Object}    config
 * @param  {String}    config.name       Template name
 * @param  {String}    config.tag        Template tag
 * @param  {String}    [config.version]  Template version
 * @return {Promise}                     Resolves if tagged successfully
 */
function tagTemplate({ path, name, tag, version }) {
    const hostname = SD_API_URL;
    const url = URL.resolve(hostname, path);

    if (!version) {
        return getLatestVersion(name).then(latest => tagTemplate({ path, name, tag, version: latest }));
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
 * Tags a specific template version by posting to the SDAPI /templates/{templateName}/tags/{tagName} endpoint
 * @method tagJobTemplate
 * @param  {Object}    config
 * @param  {String}    config.name       Template name
 * @param  {String}    config.tag        Template tag
 * @param  {String}    [config.version]  Template version
 * @return {Promise}                     Resolves if tagged successfully
 */
function tagJobTemplate({ name, tag, version }) {
    const path = `templates/${encodeURIComponent(name)}/tags/${encodeURIComponent(tag)}`;

    return tagTemplate({ path, name, tag, version });
}

/**
 * Tags a specific template version by posting to the SDAPI /pipeline/templates/{name}/tags/{tag} endpoint
 * @method tagPipelineTemplate
 * @param  {Object}    config
 * @param  {String}    config.namespace  Template namespace
 * @param  {String}    config.name       Template name
 * @param  {String}    config.tag        Template tag
 * @param  {String}    [config.version]  Template version
 * @return {Promise}                     Resolves if tagged successfully
 */
async function tagPipelineTemplate({ namespace, name, tag, version }) {
    const path = `pipeline/template/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/tags/${tag}`;

    const res = await tagTemplate({ path, name, tag, version });

    return {
        namespace,
        name,
        tag,
        version: res.version
    };
}

/**
 * Removes a tag from a template.
 * @param {Object} config - The config for removing the tag.
 * @param {string} config.path - The path of the template.
 * @param {string} config.name - The name of the template.
 * @param {string} config.tag - The tag to be removed.
 * @returns {Promise<void>} - A promise that resolves when the tag is successfully removed.
 * @throws {Error} - If there is an error removing the tag.
 */
function removeTag({ path, name, tag }) {
    const hostname = SD_API_URL;
    const url = URL.resolve(hostname, path);

    return request({
        method: 'DELETE',
        url,
        context: {
            token: process.env.SD_TOKEN
        }
    }).then(response => {
        const { body, statusCode } = response;

        if (statusCode !== 204) {
            throw new Error(
                `Error removing template ${name} tag ${tag}. ${statusCode} (${body.error}): ${body.message}`
            );
        }
    });
}

/**
 * Removes a job template.
 * @param {Object} config - The config for removing the job template.
 * @param {string} config.name - The name of the job template to be removed.
 * @returns {Object} - The removed job template's name.
 */
async function removeJobTemplate(name) {
    const path = `templates/${encodeURIComponent(name)}`;

    await removeTemplate({ path, name });

    return {
        name
    };
}

/**
 * Removes a pipeline template.
 * @param {Object} config - The config for removing the pipeline template.
 * @param {string} config.namespace - The namespace of the pipeline template.
 * @param {string} config.name - The name of the pipeline template.
 * @returns {Object} - The removed pipeline template's namespace and name.
 */
async function removePipelineTemplate({ namespace, name }) {
    const path = `pipeline/templates/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`;

    await removeTemplate({ path, name: `${namespace}/${name}` });

    return {
        namespace,
        name
    };
}

/**
 * Removes a job template version.
 * @param {Object} params - The parameters for removing the job template version.
 * @param {string} params.name - The name of the job template.
 * @param {string} params.version - The version of the job template.
 * @returns {Object} - The removed job template version.
 */
async function removeJobTemplateVersion({ name, version }) {
    const path = `templates/${encodeURIComponent(name)}/versions/${version}`;

    await removeVersion({ path, name, version });

    return {
        name,
        version
    };
}

/**
 * Removes a specific version of a pipeline template.
 * @param {Object} config - The config for removing the pipeline template version.
 * @param {string} config.namespace - The namespace of the pipeline template.
 * @param {string} config.name - The name of the pipeline template.
 * @param {string} config.version - The version of the pipeline template to remove.
 * @returns {Object} - The removed pipeline template version details.
 */
async function removePipelineTemplateVersion({ namespace, name, version }) {
    const path = `pipeline/template/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/versions/${version}`;

    await removeVersion({ path, name: `${namespace}/${name}`, version });

    return {
        namespace,
        name,
        version
    };
}

/**
 * Removes a tag from a job template.
 * @param {Object} config - The config for removing the tag.
 * @param {string} config.name - The name of the job template.
 * @param {string} config.tag - The tag to be removed.
 * @returns {Object} - The name and tag of the removed tag.
 */
async function removeJobTemplateTag({ name, tag }) {
    const path = `templates/${encodeURIComponent(name)}/tags/${tag}`;

    await removeTag({ path, name, tag });

    return {
        name,
        tag
    };
}

/**
 * Removes a pipeline template tag.
 * @param {Object} config - The config for removing the tag.
 * @param {string} config.namespace - The namespace of the pipeline template.
 * @param {string} config.name - The name of the pipeline template.
 * @param {string} config.tag - The tag to be removed.
 * @returns {Object} - The removed pipeline template tag information.
 */
async function removePipelineTemplateTag({ namespace, name, tag }) {
    const path = `pipeline/template/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/tags/${tag}`;

    await removeTag({ path, name: `${namespace}/${name}`, tag });

    return {
        namespace,
        name,
        tag
    };
}

/**
 * Retrieves the version of a job template based on its name and tag.
 * @param {Object} config - The config for retrieving the version.
 * @param {string} config.name - The name of the job template.
 * @param {string} config.tag - The tag of the job template.
 * @returns {Promise<Object>} A promise that resolves to an object containing the name, tag, and version of the job template.
 */
async function getVersionFromJobTemplateTag({ name, tag }) {
    const path = `templates/${encodeURIComponent(name)}/${tag}`;

    const version = await getVersionFromTag({ path, name, tag });

    return version;
}

/**
 * Retrieves the version of a pipeline template based on the provided namespace, name, and tag.
 * @param {Object} config - The config for retrieving the version.
 * @param {string} config.namespace - The namespace of the pipeline template.
 * @param {string} config.name - The name of the pipeline template.
 * @param {string} config.tag - The tag of the pipeline template.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the namespace, name, tag, and version of the pipeline template.
 */
async function getVersionFromPipelineTemplateTag({ namespace, name, tag }) {
    const path = `pipeline/template/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/${tag}`;

    const version = await getVersionFromTag({ path, name: `${namespace}/${name}`, tag });

    return version;
}

module.exports = {
    loadYaml,
    validateJobTemplate,
    publishJobTemplate,
    removeJobTemplate,
    removeJobTemplateVersion,
    tagJobTemplate,
    removeJobTemplateTag,
    getVersionFromJobTemplateTag,
    validatePipelineTemplate,
    publishPipelineTemplate,
    tagPipelineTemplate,
    removePipelineTemplate,
    removePipelineTemplateVersion,
    removePipelineTemplateTag,
    getVersionFromPipelineTemplateTag
};
