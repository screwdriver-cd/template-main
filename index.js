'use strict';

const https = require('https');
const fs = require('fs');

/**
 * Validates the template yaml by making a call to the SDAPI /validator/template endpoint
 * @method validateTemplate
 * @param  pathToTemplate    Path to template file
 * @return {Promise}         Will reject with an error if the API request returns an error
 *                           Will resolve with a JSON object with the errors and template objects
 */
function validateTemplate(pathToTemplate) {
    const options = {
        hostname: 'api.screwdriver.cd',
        port: 443,
        path: '/v4/validator/template',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.SD_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    const yaml = fs.readFileSync(pathToTemplate, 'utf8');

    return new Promise((resolve, reject) => {
        const data = [];
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data.push(chunk);
            });
            res.on('end', () => resolve(data.join('')));
        });

        req.on('error', (e) => {
            console.log(`There was a problem with request: ${e.message}`);

            return reject(e);
        });

        // write data to request body
        req.write(JSON.stringify({ yaml }));
        req.end();
    });
}

/**
 * Validates the template
 * @method exports
 * @param  {String} templatePath Path to the Screwdriver template yaml
 * @return {Promise}             Resolves with a template JSON object
 */
module.exports = (templatePath) => {
    const resultsArr = [];

    if (process.env.TEMPLATES) {
        let paths = process.env.TEMPLATES;

        paths = JSON.parse(paths);
        paths.forEach((path) => {
            console.log('in the loop. THIS IS A PATH:', path);

            resultsArr.push(validateTemplate(path)
                            .then(templateJson => JSON.parse(templateJson)));
        });
    } else {
        const path = templatePath || './sd-template.yaml';

        resultsArr.push(validateTemplate(path)
                        .then(templateJson => JSON.parse(templateJson)));
    }

    return Promise.all(resultsArr);
};
