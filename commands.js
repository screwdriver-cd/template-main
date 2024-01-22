'use strict';

const nomnom = require('nomnom');
const index = require('./index');
const path = process.env.SD_TEMPLATE_PATH || './sd-template.yaml';

const operations = {
    /* Publish job template */
    publish: {
        opts: {
            json: { abbr: 'j', flag: true, help: 'Output result as json' },
            tag: { abbr: 't', default: 'latest', help: 'Add template tag' }
        },
        exec(opts) {
            return index
                .loadYaml(path)
                .then(config => index.publishJobTemplate(config))
                .then(publishResult =>
                    index.tagJobTemplate({
                        name: publishResult.name,
                        tag: opts.tag,
                        version: publishResult.version
                    })
                )
                .then(result => {
                    if (!opts.json) {
                        console.log(
                            `Template ${result.name}@${result.version} was ` +
                                `successfully published and tagged as ${result.tag}`
                        );
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'publish template'
    },

    /* Validate job template */
    validate: {
        opts: {
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },
        exec(opts) {
            return index
                .loadYaml(path)
                .then(config => index.validateJobTemplate(config))
                .then(result => {
                    if (!opts.json) {
                        console.log('Template is valid');
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'validate template'
    },

    /* Add tag for job template */
    tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            tag: { abbr: 't', required: true, help: 'Tag name' },
            version: { abbr: 'v', required: false, help: 'Tag version' },
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },
        exec(opts) {
            return index
                .tagJobTemplate({
                    name: opts.name,
                    tag: opts.tag,
                    version: opts.version
                })
                .then(result => {
                    if (!opts.json) {
                        console.log(
                            `Template ${result.name}@${result.version} was successfully tagged as ${result.tag}`
                        );
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'add tag'
    },

    /* Remove tag for job template */
    remove_tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            tag: { abbr: 't', required: true, help: 'Tag name' },
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },

        exec(opts) {
            return index
                .removeJobTemplateTag({
                    name: opts.name,
                    tag: opts.tag
                })
                .then(result => {
                    if (!opts.json) {
                        console.log(`Tag ${opts.tag} was successfully removed from ${opts.name}`);
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'remove tag'
    },

    /* Remove job template version */
    remove_version: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            version: { abbr: 'v', required: true, help: 'Version' },
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },

        exec(opts) {
            return index
                .removeJobTemplateVersion({
                    name: opts.name,
                    version: opts.version
                })
                .then(result => {
                    if (!opts.json) {
                        console.log(`Version ${opts.version} was successfully removed from ${opts.name}`);
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'remove version'
    },

    /* remove a job template */
    remove_template: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },

        exec(opts) {
            return index
                .removeJobTemplate(opts.name)
                .then(result => {
                    if (!opts.json) {
                        console.log(`Template ${result.name} was successfully removed`);
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'remove template'
    },

    /* get job template version number from tag */
    get_version_from_tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            tag: { abbr: 't', required: true, help: 'Tag name' }
        },

        exec(opts) {
            return index
                .getVersionFromJobTemplateTag({
                    name: opts.name,
                    tag: opts.tag
                })
                .then(result => {
                    console.log(`${result}`);
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'get version from tag'
    },

    /* Validate pipeline template */
    validate_pipeline_template: {
        opts: {
            json: { abbr: 'j', flag: true, help: 'Output result as json' }
        },
        exec(opts) {
            return index
                .loadYaml(path)
                .then(config => index.validatePipelineTemplate(config))
                .then(result => {
                    if (!opts.json) {
                        console.log('Template is valid');
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'validate pipeline template'
    },

    /* Publish pipeline template */
    publish_pipeline_template: {
        opts: {
            json: { abbr: 'j', flag: true, help: 'Output result as json' },
            tag: { abbr: 't', default: 'latest', help: 'Add template tag' }
        },
        exec(opts) {
            return index
                .loadYaml(path)
                .then(config => index.publishPipelineTemplate(config))
                .then(publishResult =>
                    index.tagPipelineTemplate({
                        name: publishResult.name,
                        namespace: publishResult.namespace,
                        tag: opts.tag,
                        version: publishResult.version
                    })
                )
                .then(result => {
                    if (!opts.json) {
                        console.log(
                            `Pipeline template ${result.name}@${result.version} was successfully published and tagged as ${result.tag}`
                        );
                    } else {
                        console.log(JSON.stringify(result));
                    }
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        },
        help: 'publish pipeline template'
    },
    /* Add tag for pipeline template */
    tag_pipeline_template: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            namespace: {
                required: true,
                abbr: 's',
                help: 'Template namespace'
            },
            tag: { abbr: 't', required: true, help: 'Tag name' },
            version: { abbr: 'v', required: false, help: 'Tag version' }
        },
        exec(opts) {
            return index
                .tagPipelineTemplate({
                    name: opts.name,
                    namespace: opts.namespace,
                    tag: opts.tag,
                    version: opts.version
                })
                .then(result => {
                    console.log(JSON.stringify(result));
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        }
    },
    get_version_from_pipeline_template_tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            namespace: {
                required: true,
                abbr: 's',
                help: 'Template namespace'
            },
            tag: { abbr: 't', required: true, help: 'Tag name' }
        },
        exec(opts) {
            return index
                .getVersionFromPipelineTemplateTag({
                    name: opts.name,
                    namespace: opts.namespace,
                    tag: opts.tag
                })
                .then(result => {
                    console.log(`${result}`);
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        }
    },
    /* Remove pipeline template */
    remove_pipeline_template: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            namespace: {
                required: true,
                abbr: 's',
                help: 'Template namespace'
            }
        },
        exec(opts) {
            return index
                .removePipelineTemplate({
                    name: opts.name,
                    namespace: opts.namespace
                })
                .then(result => {
                    console.log(JSON.stringify(result));
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        }
    },
    remove_pipeline_template_tag: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            namespace: {
                required: true,
                abbr: 's',
                help: 'Template namespace'
            },
            tag: { abbr: 't', required: true, help: 'Tag name' }
        },
        exec(opts) {
            return index
                .removePipelineTemplateTag({
                    name: opts.name,
                    namespace: opts.namespace,
                    tag: opts.tag
                })
                .then(result => {
                    console.log(JSON.stringify(result));
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        }
    },
    remove_pipeline_template_version: {
        opts: {
            name: { required: true, abbr: 'n', help: 'Template name' },
            namespace: {
                required: true,
                abbr: 's',
                help: 'Template namespace'
            },
            version: { abbr: 'v', required: true, help: 'Version' }
        },
        exec(opts) {
            return index
                .removePipelineTemplateVersion({
                    name: opts.name,
                    namespace: opts.namespace,
                    version: opts.version
                })
                .then(result => {
                    console.log(JSON.stringify(result));
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        }
    }
};

/**
 * Execute the given command by name.
 * @method run
 * @param  {String}    command name
 * @return {Object}    result of command, if any
 */
function run(name) {
    const opts = nomnom.options(operations[name].opts).help(operations[name].help).parse();

    return operations[name].exec(opts);
}

module.exports = {
    operations,
    run
};
