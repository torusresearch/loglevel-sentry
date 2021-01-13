# loglevel-sentry

[![npm version](https://badge.fury.io/js/%40toruslabs%2Floglevel-sentry.svg)](https://badge.fury.io/js/%40toruslabs%2Floglevel-sentry)
![npm](https://img.shields.io/npm/dw/@toruslabs/loglevel-sentry)

## Introduction

This repo allows you to log + track logs using sentry

## Features

- Typescript compatible. Includes Type definitions

## Installation

### Bundling

This module is distributed in 4 formats

- `commonjs` build `dist/loglevel-sentry.cjs.js` in es5 format
- `umd` build `dist/loglevel-sentry.umd.min.js` in es5 format without polyfilling corejs minified
- `umd` build `dist/loglevel-sentry.polyfill.umd.min.js` in es5 format with polyfilling corejs minified
- `node` build `dist/fetchNodeDetails-node.js` in es5 format

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

2. TODO

## Info

// TODO

## Best practices

// TODO

## Requirements

- This package requires a peer dependency of `@babel/runtime`
- Node 10+
