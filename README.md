# loglevel-sentry

[![npm version](https://badge.fury.io/js/%40toruslabs%2Floglevel-sentry.svg)](https://badge.fury.io/js/%40toruslabs%2Floglevel-sentry)
![npm](https://img.shields.io/npm/dw/@toruslabs/loglevel-sentry)

## Introduction

This repo allows you to log + track logs using sentry

## Features

- Typescript compatible. Includes Type definitions

## Installation

### Bundling

This module is distributed in 3 formats

- `lib.esm` build `dist/lib.esm/index.js` in es6 format
- `lib.cjs` build `dist/lib.cjs/index.js` in es5 format
- `umd` build `dist/loglevelSentry.umd.min.js` in es5 format without polyfilling corejs minified

By default, the appropriate format is used for your specified usecase
You can use a different format (if you know what you're doing) by referencing the correct file

The cjs build is not polyfilled with core-js.
It is upto the user to polyfill based on the browserlist they target

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
import loglevel from "loglevel";
import * as Sentry from "@sentry/browser";
// Node.js: import * as Sentry from "@sentry/node";
import LoglevelSentryPlugin from "@toruslabs/loglevel-sentry";

logger = loglevel.getLogger("__LOGGER_NAME__");

const plugin = new LoglevelSentryPlugin(Sentry);
sentry.install(logger);
```

(Optional) You can replace loglevel with other logging library by using loglevel `methodFactory` API:

```js
import loglevel from "loglevel";
import pino from "pino";
import * as Sentry from "@sentry/browser";
// Node.js: import * as Sentry from "@sentry/node";
import LoglevelSentryPlugin from "@toruslabs/loglevel-sentry";

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

- This package requires a peer dependency of `@babel/runtime`
- Node 20+
