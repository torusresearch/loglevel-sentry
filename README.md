# loglevel-sentry

[![npm version](https://badge.fury.io/js/%40toruslabs%2Floglevel-sentry.svg)](https://badge.fury.io/js/%40toruslabs%2Floglevel-sentry)
![npm](https://img.shields.io/npm/dw/@toruslabs/loglevel-sentry)

## Introduction

This repo allows you to log + track logs using sentry

## Features

- Typescript compatible. Includes Type definitions

## Installation

### Bundling

This module is distributed in 2 formats

- `lib.esm` build `dist/lib.esm/index.js`
- `lib.cjs` build `dist/lib.cjs/index.js`

Types are published at `dist/lib.cjs/index.d.ts`. The package does not include a UMD bundle or a core-js polyfill.

### Directly in Browser

CDN's serve the non-core-js polyfilled version by default. You can use a different

jsdeliver

```js
<script src="https://cdn.jsdelivr.net/npm/@toruslabs/loglevel-sentry"></script>
```

unpkg

```js
<script src="https://unpkg.com/@toruslabs/loglevel-sentry"></script>
```

## Usage

Add [`@toruslabs/loglevel-sentry`](https://www.npmjs.com/package/@toruslabs/loglevel-sentry) to your project:

To use this module:

1. Install the package
   `npm i @toruslabs/loglevel-sentry`

2. Create your `loglevel` instance and install this plugin to enable Sentry:

```js
import * as Sentry from "@sentry/browser";
// Node.js: import * as Sentry from "@sentry/node";
import { LoglevelSentry as LoglevelSentryPlugin } from "@toruslabs/loglevel-sentry";
import loglevel from "loglevel";

logger = loglevel.getLogger("__LOGGER_NAME__");

const plugin = new LoglevelSentryPlugin(Sentry);
sentry.install(logger);
```

(Optional) You can replace loglevel with other logging library by using loglevel `methodFactory` API:

```js
import * as Sentry from "@sentry/browser";
// Node.js: import * as Sentry from "@sentry/node";
import { LoglevelSentry as LoglevelSentryPlugin } from "@toruslabs/loglevel-sentry";
import loglevel from "loglevel";
import pino from "pino";

const logger = loglevel.getLogger("__LOGGER_NAME__");
logger.methodFactory = (method, level, name) => {
  const alt = pino(name, level);
  return alt[method];
};

const sentry = new LoglevelSentryPlugin(Sentry);
sentry.install(logger);
```

## Info

Is 100% compatible with `loglevel` API. Events/errors will be reported for all enabled log functions.

## Best practices

Though it isn't compulsory, it is recommended to call log functions with following signatures:

- `log.trace`, `log.debug`, `log.info`, and `log.warn`: `(msg: string, ...others: any[])`.

- `log.error`: `(err: Error, ...others: any[])`.

If you always want to monitor a specific event regardless of configured log level, use the plugin API:

```js
const sentry = new LoglevelSentryPlugin(Sentry);
sentry.install(logger);

sentry.trace("this", "message", "will always be reported.");
```

## Requirements

- Node.js >=24.22.0 and npm >=12
- `@sentry/browser` or `@sentry/node`, depending on the runtime
