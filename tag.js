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
    .parse();

return index.tagTemplate({
    name: opts.name,
    tag: opts.tag,
    version: opts.version
})
.then(console.log)
.catch((err) => {
    console.error(err);
    process.exit(1);
});
