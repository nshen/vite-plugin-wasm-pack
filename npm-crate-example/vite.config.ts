import { defineConfig } from 'vite';
import wasmPack from 'vite-plugin-wasm-pack';

export default defineConfig({
  build: {
    minify: false
  },
  // use test-npm-crate from https://www.npmjs.com/package/test-npm-crate
  // we have no local crate, so leave the first param an empty array
  plugins: [wasmPack([], ['test-npm-crate'])]
});
