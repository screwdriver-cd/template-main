#!/usr/bin/env node

'use strict';

const index = require('./index');
const nomnom = require('nomnom');
const opts = nomnom
    .option('name', {
        required: true,
        abbr: 'n',
        help: 'Template name'
    })
    .option('tag', {
        abbr: 't',
        required: true,
        help: 'Tag name'
    })
    .option('version', {
        abbr: 'v',
        required: true,
        help: 'Tag version'
    })
    .option('json', {
        abbr: 'j',
        flag: true,
        help: 'Output result as json'
    })
    .parse();

return index.tagTemplate({
    name: opts.name,
    tag: opts.tag,
    version: opts.version
})
    .then((result) => {
        if (!opts.json) {
            console.log(
                `Template ${result.name}@${result.version} was successfully tagged as ${result.tag}`
            );
        } else {
            console.log(JSON.stringify(result));
        }
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
