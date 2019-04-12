#!/usr/bin/env node

'use strict';

// This creates a single top-level command with subcommands
// (similar to git with 'git branch', 'git status', etc)
//
// The other commands are kept around for backwards compatibility.
const operations = require('../commands').operations;
const nomnom = require('nomnom');

Object.keys(operations).forEach((key) => {
    nomnom.command(key)
        .options(operations[key].opts)
        .callback(operations[key].exec)
        .help(operations[key].help);
});

nomnom.parse();
