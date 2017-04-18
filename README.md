# template-main
[![Version][npm-image]][npm-url] ![Downloads][downloads-image] [![Build Status][status-image]][status-url] [![Open Issues][issues-image]][issues-url] [![Dependency Status][daviddm-image]][daviddm-url] ![License][license-image]

> Validates and publishes templates

## Usage

```bash
npm install screwdriver-template-main
```

### Validating a template

Run the `template-validate` script. By default, the path `./sd-template.yaml` will be read. However, a user can specify a custom path using the env variable: `SD_TEMPLATE_PATH`.

To validate multiple templates in the same repo, a template maintainer would use the following pattern in their `screwdriver.yaml`:

```yaml
shared:
    image: node:6
jobs:
    main:  
        steps:
            - install: npm install screwdriver-template-main
            - validate: ./node_modules/.bin/template-validate
        environment:
            SD_TEMPLATE_PATH: ./path/to/template.yaml
```

### Publishing a template

Run the `template-publish` script. By default, the path `./sd-template.yaml` will be read. However, a user can specify a custom path using the env variable: `SD_TEMPLATE_PATH`.

To publish multiple templates in the same repo, a template maintainer would use the following pattern in their `screwdriver.yaml`:

```yaml
shared:
    image: node:6
jobs:
    main:  
        steps:
            - install: npm install screwdriver-template-main
            # this is run by the PRs as well
            - validate: ./node_modules/.bin/template-validate
    publish:
        steps:
            - install: npm install screwdriver-template-main
            # publishing also validates
            - publish: ./node_modules/.bin/template-publish
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
