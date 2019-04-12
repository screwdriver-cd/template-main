'use strict';

const index = require('./index');
const path = process.env.SD_TEMPLATE_PATH || './sd-template.yaml';
const nomnom = require('nomnom');

const operations = {

    /* Publish template */
    publish: {
        opts: {
            json: { abbr: 'j', flag: true, help: 'Output result as json' },
            tag: { abbr: 't', default: 'latest', help: 'Add template tag' }
        },
        exec(opts) {
            return index.loadYaml(path)
                .then(config => index.publishTemplate(config))
                .then(publishResult => index.tagTemplate({
                    name: publishResult.name,
                    tag: opts.tag,
                    version: publishResult.version
                }))
                .then((result) => {
                    if (!opts.json) {
                        console.log(`Template ${result.name}@${result.version} was `
                            + `successfully published and tagged as ${result.tag}`);
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch((err) => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'publish template'
    },

    /* Validate template */
    validate: {
        opts: {
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },
        exec(opts) {
            return index.loadYaml(path)
                .then(config => index.validateTemplate(config))
                .then((result) => {
                    if (!opts.json) {
                        console.log('Template is valid');
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch((err) => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'validate template'
    },

    /* Add tag for template */
    tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            tag: { abbr: 't', required: true, help: 'Tag name' },
            version: { abbr: 'v', required: false, help: 'Tag version' },
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },
        exec(opts) {
            return index.tagTemplate({
                name: opts.name,
                tag: opts.tag,
                version: opts.version
            })
                .then((result) => {
                    if (!opts.json) {
                        console.log(
                            `Template ${result.name}@${result.version} was successfully ` +
                            `tagged as ${result.tag}`
                        );
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch((err) => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'add tag'
    },

    /* Remove tag for template */
    remove_tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            tag: { abbr: 't', required: true, help: 'Tag name' },
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },

        exec(opts) {
            return index.removeTag({
                name: opts.name,
                tag: opts.tag
            })
                .then((result) => {
                    if (!opts.json) {
                        console.log(`Tag ${opts.tag} was successfully removed from ${opts.name}`);
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch((err) => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'remove tag'
    },

    /* remove a tamplte */
    remove_template: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },

        exec(opts) {
            return index.removeTemplate(opts.name)
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
        },
        help: 'remove template'
    },

    /* get version number from tag */
    get_version_from_tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            tag: { abbr: 't', required: true, help: 'Tag name' }
        },

        exec(opts) {
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
        },
        help: 'get version from tag'
    }
};

/**
 * Execute the given command by name.
 * @method run
 * @param  {String}    command name
 * @return {Object}    result of command, if any
 */
function run(name) {
    const opts = nomnom.options(operations[name].opts)
        .help(operations[name].help)
        .parse();

    return operations[name].exec(opts);
}

module.exports = {
    operations,
    run
};
