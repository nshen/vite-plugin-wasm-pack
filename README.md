# 🚚 vite-plugin-wasm-pack

[![npm](https://img.shields.io/npm/v/vite-plugin-wasm-pack.svg)](https://www.npmjs.com/package/vite-plugin-wasm-pack)

🚚 Vite plugin for rust [wasm-pack](https://github.com/rustwasm/wasm-pack), it's simple.

## Quick start

Make sure [wasm-pack](https://github.com/rustwasm/wasm-pack) installed correctly.

Clone this repo or download the [zip file](https://github.com/nshen/vite-plugin-wasm-pack/archive/refs/heads/main.zip), extract the example folder.

```bash
example
  |
  |-- my-crate       # rust project folder, there is a Cargo.toml in it
  |-- src            # front end source code
  |   |-- index.ts   # entry point
  |-- index.html     # html entry
  |-- vite.config.ts # vite config file
  |__ package.json   # npm config file
```

Install npm develop dependencies, **in example folder** run:

```bash
yarn install
# or
# npm install
```

After that you can build `rust project` to `WebAassembly` by using `wasm-pack`.

```bash
wasm-pack build ./my-crate --target web
```

Now the `my-crate` module is ready, start vite dev server.

```bash
yarn dev
or
#npm run dev
```

Done, if below is showing.

```bash
  vite v2.3.8 dev server running at:

  > Local: http://localhost:3000/

  ready in 169ms.
```

---

## Install manually

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
