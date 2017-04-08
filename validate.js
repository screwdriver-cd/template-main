#!/usr/bin/env node

'use strict';

require('./index').validateTemplate()
    .then(res => console.log(res))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
