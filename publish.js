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
    .option('tag', {
        abbr: 't',
        default: 'latest',
        help: 'Add template tag'
    })
    .parse();

return index.loadYaml(path)
    .then(config => index.publishTemplate(config))
    .then(publishResult => index.tagTemplate({
        name: publishResult.name,
        tag: opts.tag,
        version: publishResult.version
    }))
    .then((result) => {
        if (!opts.json) {
            console.log(`Template ${result.name}@${result.version} was `
                + `successfully published and tagged as ${result.tag}`);
        } else {
            console.log(JSON.stringify(result));
        }
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
