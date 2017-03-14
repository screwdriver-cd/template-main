'use strict';

const fs = require('fs');
const request = require('request');

/**
 * Will stringify a sd-template.yaml file
 * @method stringifyYaml
 * @param  {String}      pathToYaml Path to the Screwdriver template yaml
 * @return {Promise}                Promises to return a stringified yaml
 */
function stringifyYaml(pathToYaml) {
    console.log(pathToYaml);
    console.log(JSON.stringify(fs.readFileSync(pathToYaml, 'utf8'), null, 4));

    return Promise.resolve(JSON.stringify(fs.readFileSync(pathToYaml, 'utf8'), null, 4));
}

/**
 * Validates the template yaml by making a call to the SDAPI /validator/template endpoint
 * @method validateTemplate
 * @return {Promise}         Will reject with an error if the API request returns an error
 *                           Will resolve with a JSON object with the errors and template objects
 */
function validateTemplate(stringifiedYaml) {
    console.log('stringifiedYaml: ', stringifiedYaml);

    return new Promise((resolve, reject) => {
        request({
            auth: {
                bearer: `${process.env.SD_TOKEN}`
            },
            body: {
                yaml: stringifiedYaml
            },
            json: true,
            method: 'POST',
            url: 'https://api.screwdriver.cd/v4/validator/template'
        }, (err, response) => {
            if (err) {
                return reject(err);
            }

            return resolve(response);
        });
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
