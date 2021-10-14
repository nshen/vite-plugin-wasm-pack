import init, { greet } from 'test-npm-crate';

init().then(() => {
  greet();
});
