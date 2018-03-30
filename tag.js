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
        required: false,
        help: 'Tag version'
    })
    .option('json', {
        abbr: 'j',
        flag: true,
        help: 'Output result as json'
    })
    .option('delete', {
        abbr: 'd',
        flag: true,
        help: 'Deletes a template tag'
    })
    .parse();
const { name, tag, version } = opts;

(opts.delete
    ? index.removeTag({ name, tag })
    : index.tagTemplate({ name, tag, version }))
    .then((result) => {
        if (opts.json) {
            console.log(JSON.stringify(result));
        } else if (opts.delete) {
            console.log(`Tag ${tag} was successfully removed from ${name}`);
        } else {
            // version could be undefined if user wants to tag latest template
            console.log(`Template ${name}@${result.version} was successfully tagged as ${tag}`);
        }
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
