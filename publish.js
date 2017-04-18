#!/usr/bin/env node

'use strict';

const index = require('./index');
const path = process.env.SD_TEMPLATE_PATH || './sd-template.yaml';

return index.loadYaml(path)
    .then(config => index.publishTemplate(config))
    .then(console.log)
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
