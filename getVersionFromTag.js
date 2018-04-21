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
    .parse();

return index.getVersionFromTag({
    name: opts.name,
    tag: opts.tag
})
    .then((result) => {
        console.log(`${result}`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
