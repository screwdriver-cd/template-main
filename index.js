'use strict';

const fs = require('fs');
const https = require('https');

/**
 * Will stringify a sd-template.yaml file
 * @method stringifyYaml
 * @param  {String}      pathToYaml Path to the Screwdriver template yaml
 * @return {Promise}                Promises to return a stringified yaml
 */
function stringifyYaml(pathToYaml) {
    return Promise.resolve(JSON.stringify(fs.readFileSync(pathToYaml, 'utf8'), null, 4));
}

/**
 * Validates the template yaml by making a call to the SDAPI /validator/template endpoint
 * @method validateTemplate
 * @return {Promise}         Will reject with an error if the API request returns an error
 *                           Will resolve with a JSON object with the errors and template objects
 */
function validateTemplate(stringifiedYaml) {
    // console.log('stringifiedYaml: ', stringifiedYaml);
    // eslint-disable-next-line quotes, max-len, no-useless-escape
    const yaml = stringifiedYaml.replace(/\"/g, "");

    return new Promise((resolve) => {
        const options = {
            url: 'https://api.screwdriver.cd/v4/validator/template',
            method: 'POST',
            auth: {
                bearer: `${process.env.SD_TOKEN}`
            },
            body: {
                yaml
            },
            json: true
        };

        https.request(options, res => resolve(res));
    });
}

/**
 * Validates the template
 * @method exports
 * @param  {String} templatePath Path to the Screwdriver template yaml
 * @return {Promise}             Resolves with a template JSON object
 */
module.exports = (templatePath) => {
    const path = templatePath || './sd-template.yaml';

    return stringifyYaml(path)
        .then(validateTemplate)
        // do some meta set thing here with the JSON object??
        .then(templateJson => templateJson)
        .catch(err => Promise.reject(err));
};
