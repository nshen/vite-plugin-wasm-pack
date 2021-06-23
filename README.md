# 🚚 vite-plugin-wasm-pack

[![npm](https://img.shields.io/npm/v/vite-plugin-wasm-pack.svg)](https://www.npmjs.com/package/vite-plugin-wasm-pack)

Vite plugin for [wasm-pack](https://github.com/rustwasm/wasm-pack) rust

## Install

```bash
yarn add vite vite-plugin-wasm-pack -D
# or
# npm i vite vite-plugin-wasm-pack vite -D
```

## Usage

Add this plugin to `vite.config.ts`

```js
import { defineConfig } from 'vite';
import wasmPack from 'vite-plugin-wasm-pack';

export default defineConfig({
  build: {
    minify: false
  },
  // pass your crate path to the plugin
  plugins: [wasmPack('./my-crate')]
});
```

⚠ **Don't forget to build your [wasm-pack](https://github.com/rustwasm/wasm-pack) crate first!**

```bash
wasm-pack build ./my-crate --target web
```

Add command to `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "vite build"
}
```

Start dev server, and install `my-crate` that you build earlier.

```bash
yarn dev
```

## Complete example

please check [./example](./example) folder.

## License

MIT, see [the license file](./LICENSE)
