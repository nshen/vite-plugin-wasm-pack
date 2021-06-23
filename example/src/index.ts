//@ts-ignore
import init, { greet } from 'my-crate';
// Don't worry if vscode told you can't find my-crate
// after yarn dev, wasm-pack plugin will install my-crate for you

init().then(() => {
  console.log('init wasm-pack');
  greet('from vite!');
});
