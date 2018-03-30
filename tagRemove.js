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
    .option('json', {
        abbr: 'j',
        flag: true,
        help: 'Output result as json'
    })
    .parse();

index.removeTag({
    name: opts.name,
    tag: opts.tag
})
    .then((result) => {
        if (opts.json) {
            console.log(JSON.stringify(result));
        } else {
            console.log(`Tag ${opts.tag} was successfully removed from ${opts.name}`);
        }
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
