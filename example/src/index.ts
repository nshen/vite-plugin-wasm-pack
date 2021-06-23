//@ts-ignore
import init, { greet } from 'my-crate';

init().then(() => {
  console.log('init wasm-pack');
  greet('from vite!');
});
