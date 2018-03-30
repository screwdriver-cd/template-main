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

index.tagTemplate({
    name: opts.name,
    tag: opts.tag,
    version: opts.version
})
    .then((result) => {
        if (opts.json) {
            console.log(JSON.stringify(result));
        } else {
            // eslint-disable-next-line max-len
            console.log(`Template ${opts.name}@${opts.version} was successfully tagged as ${opts.tag}`);
        }
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
