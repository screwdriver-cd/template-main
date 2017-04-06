'use strict';

const request = require('request');
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
        url: 'https://api.screwdriver.cd:443/v4/templates'
    };

    request(params, (err, response, body) => {
        if (err) {
            throw new Error(`Error sending request: ${err}`);
        } else if (response.statusCode !== 201) {
            throw new Error('Template was not published. ' +
                `${body.statusCode} (${body.error}): ${body.message}`);
        } else {
            console.log('Template successfully published.');
        }
    });

    return null;
}

module.exports = {
    publishTemplate
};
