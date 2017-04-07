#!/usr/bin/env node

'use strict';

require('./index').publishTemplate()
    .then(console.log)
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
