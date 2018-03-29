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
    .option('json', {
        abbr: 'j',
        flag: true,
        help: 'Output result as json'
    })
    .parse();

return index.removeTemplate({ name: opts.name })
.then((result) => {
    if (!opts.json) {
        console.log(`Template ${result.name} was successfully removed`);
    } else {
        console.log(JSON.stringify(result));
    }
})
.catch((err) => {
    console.error(err);
    process.exit(1);
});
