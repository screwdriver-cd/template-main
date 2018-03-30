# template-main
[![Version][npm-image]][npm-url] ![Downloads][downloads-image] [![Build Status][status-image]][status-url] [![Open Issues][issues-image]][issues-url] [![Dependency Status][daviddm-image]][daviddm-url] ![License][license-image]

> Validates and publishes templates

## Usage

```bash
npm install screwdriver-template-main
```

Create a Screwdriver pipeline with your template repo and start the build to validate and publish it.

To update a Screwdriver template, make changes in your SCM repository and rerun the pipeline build.

### Validating a template

Run the `template-validate` script. By default, the path `./sd-template.yaml` will be read. However, a user can specify a custom path using the env variable: `SD_TEMPLATE_PATH`.

Example `screwdriver.yaml`:

```yaml
shared:
    image: node:6
jobs:
    main:
        requires: [~pr, ~commit]
        steps:
            - install: npm install screwdriver-template-main
            - validate: ./node_modules/.bin/template-validate
        environment:
            SD_TEMPLATE_PATH: ./path/to/template.yaml
```

`template-validate` can print a result as json by passing `--json` option to the command.

```
$ ./node_modules/.bin/template-validate --json
{"valid":true}
```

### Publishing a template

Run the `template-publish` script. By default, the path `./sd-template.yaml` will be read. However, a user can specify a custom path using the env variable: `SD_TEMPLATE_PATH`.

Example `screwdriver.yaml` with validation and publishing:

```yaml
shared:
    image: node:6
jobs:
    main:
        requires: [~pr, ~commit]
        steps:
            - install: npm install screwdriver-template-main
            - validate: ./node_modules/.bin/template-validate
    publish:
        requires: main
        steps:
            - install: npm install screwdriver-template-main
            - publish: ./node_modules/.bin/template-publish
```

`template-publish` can print a result as json by passing `--json` option to the command.

```
$ ./node_modules/.bin/template-publish --json
{name:"template/foo",version:"1.2.3"}
```

### Removing a template

To remove a template, run the `template-remove` script. You'll need to add an argument for the template name. Removing a template will remove _all_ of its versions.

Example `screwdriver.yaml` with validation and publishing, and template removal as a detached job:

```yaml
shared:
    image: node:6
jobs:
    main:
        requires: [~pr, ~commit]
        steps:
            - install: npm install screwdriver-template-main
            - validate: ./node_modules/.bin/template-validate
    publish:
        requires: main
        steps:
            - install: npm install screwdriver-template-main
            - publish: ./node_modules/.bin/template-publish
    remove_template:
        steps:
            - install: npm install screwdriver-template-main
            - remove: ./node_modules/.bin/template-remove --name templateName
```

`template-remove` can print a result as json by passing `--json` option to the command.

```
$ ./node_modules/.bin/template-remove --json --name templateName
{"name":"templateName"}
```

### Tagging a template

Optionally, tag a template using the `template-tag` script. This must be done in the same pipeline that published the template. You'll need to add arguments for the template name, version, and tag. The version must be an exact version, not just a major or major.minor one.

Example `screwdriver.yaml` with validation and publishing and tagging:

```yaml
shared:
    image: node:6
jobs:
    main:
        requires: [~pr, ~commit]
        steps:
            - install: npm install screwdriver-template-main
            - validate: ./node_modules/.bin/template-validate
    publish:
        requires: main
        steps:
            - install: npm install screwdriver-template-main
            - publish: ./node_modules/.bin/template-publish
            - tag: ./node_modules/.bin/template-tag --name templateName --version 1.2.3 --tag stable
```

`template-tag` can print a result as json by passing `--json` option to the command.

```
$ ./node_modules/.bin/template-tag --json --name templateName --version 1.2.3 --tag stable
{"name":"templateName","tag":"stable","version":"1.2.3"}
```

### Removing a template tag


To remove a template tag, run the `template-remove-tag` binary. This must be done in the same pipeline that published the template. You'll need to specify the template name and tag as arguments.

Example `screwdriver.yaml` with validation, publishing and tagging, and tag removal as a detached job:

```yaml
shared:
    image: node:6
    steps:
        - init: npm install screwdriver-template-main
jobs:
    main:
        requires: [~pr, ~commit]
        steps:
            - validate: ./node_modules/.bin/template-validate
    publish:
        requires: main
        steps:
            - publish: ./node_modules/.bin/template-publish
            - tag: ./node_modules/.bin/template-tag --name templateName --version 1.0.0 --tag latest
    detached_remove_tag:
        steps:
            - remove: ./node_modules/.bin/template-remove-tag --name templateName --tag latest
```

`template-remove-tag` can print a result as json by passing `--json` option to the command.

```
$ ./node_modules/.bin/template-remove-tag --json --name templateName --tag stable
{"name":"templateName","tag":"stable"}
```

## Testing

```bash
npm test
```

## License

Code licensed under the BSD 3-Clause license. See LICENSE file for terms.

[npm-image]: https://img.shields.io/npm/v/screwdriver-template-main.svg
[npm-url]: https://npmjs.org/package/screwdriver-template-main
[downloads-image]: https://img.shields.io/npm/dt/screwdriver-template-main.svg
[license-image]: https://img.shields.io/npm/l/screwdriver-template-main.svg
[issues-image]: https://img.shields.io/github/issues/screwdriver-cd/template-main.svg
[issues-url]: https://github.com/screwdriver-cd/template-main/issues
[status-image]: https://cd.screwdriver.cd/pipelines/114/badge
[status-url]: https://cd.screwdriver.cd/pipelines/114
[daviddm-image]: https://david-dm.org/screwdriver-cd/template-main.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/screwdriver-cd/template-main
