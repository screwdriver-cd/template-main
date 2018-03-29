#!/usr/bin/env node

'use strict';

const index = require('./index');
const nomnom = require('nomnom');
const path = process.env.SD_TEMPLATE_PATH || './sd-template.yaml';
const opts = nomnom
    .option('json', {
        abbr: 'j',
        flag: true,
        help: 'Output result as json'
    })
    .parse();

return index.loadYaml(path)
    .then(config => index.validateTemplate(config))
    .then((result) => {
        if (!opts.json) {
            console.log('Template is valid');
        } else {
            console.log(JSON.stringify(result));
        }
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
