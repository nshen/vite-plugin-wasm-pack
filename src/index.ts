import chalk from 'chalk';
import fs from 'fs-extra';
import { isString } from 'narrowing';
import path from 'path';
import { PluginOption } from 'vite';

/**
 *   return a Vite plugin for handling wasm-pack crate
 *
 *   only use local crate
 *
 *   import wasmPack from 'vite-plugin-wasm-pack';
 *
 *   plugins: [wasmPack(['./my-local-crate'])]
 *
 *   only use npm crate, leave the first param to an empty array
 *
 *   plugins: [wasmPack([],['test-npm-crate'])]
 *
 *   use both local and npm crate
 *
 *   plugins: [wasmPack(['./my-local-crate'],['test-npm-crate'])]
 *
 * @param crates local crates paths, if you only use crates from npm, leave an empty array here.
 * @param moduleCrates crates names from npm
 */
function vitePluginWasmPack(
  crates: string[] | string,
  moduleCrates?: string[] | string
): PluginOption {
  const prefix = '@vite-plugin-wasm-pack@';
  const pkg = 'pkg'; // default folder of wasm-pack module
  let config_base: string;
  let config_assetsDir: string;
  const cratePaths: string[] = isString(crates) ? [crates] : crates;
  const modulePaths: string[] = !moduleCrates
    ? []
    : isString(moduleCrates)
    ? [moduleCrates]
    : moduleCrates;
  // from ../../my-crate  ->  my_crate_bg.wasm
  const findModuleFilePath = (cratePath: string, extension: string) => {
    const files = JSON.parse(fs.readFileSync(path.join(cratePath, 'package.json'), 'utf-8'))['files'] as string[];
    const wasm = files.filter(x => x.endsWith(extension))[0];
    return path.join(cratePath, wasm);
  };
  type CrateType = { path: string; isNodeModule: boolean };
  // wasmfileName : CrateType
  const wasmMap = new Map<string, CrateType>();
  // 'my_crate_bg.wasm': {path:'../../my_crate/pkg/my_crate_bg.wasm', isNodeModule: false}
  cratePaths.forEach((cratePath) => {
    const wasmFile = findModuleFilePath(path.join(cratePath, pkg), '.wasm');

    wasmMap.set(path.basename(wasmFile), {
      path: wasmFile,
      isNodeModule: false
    });
  });

  // 'my_crate_bg.wasm': { path: 'node_modules/my_crate/my_crate_bg.wasm', isNodeModule: true }
  modulePaths.forEach((cratePath) => {
    const wasmDirectory = path.join(process.cwd(), 'node_modules', cratePath);
    const wasmFile = findModuleFilePath(wasmDirectory, '.wasm');

    wasmMap.set(path.basename(wasmFile), {
      path: wasmFile,
      isNodeModule: true
    });
  });

  return {
    name: 'vite-plugin-wasm-pack',
    enforce: 'pre',
    configResolved(resolvedConfig) {
      config_base = resolvedConfig.base;
      config_assetsDir = resolvedConfig.build.assetsDir;
    },

    resolveId(id: string) {
      for (let i = 0; i < cratePaths.length; i++) {
        if (path.basename(cratePaths[i]) === id) return prefix + id;
      }
      return null;
    },

    async load(id: string) {
      if (id.indexOf(prefix) === 0) {
        id = id.replace(prefix, '');
        const modulejs = path.join(
          './node_modules',
          id,
          id.replace(/\-/g, '_') + '.js'
        );
        const code = await fs.promises.readFile(modulejs, {
          encoding: 'utf-8'
        });
        return code;
      }
    },

    async buildStart(_inputOptions) {
      const prepareBuild = async (cratePath: string, isNodeModule: boolean) => {
        const pkgPath = isNodeModule
          ? path.join('./node_modules', cratePath)
          : path.join(cratePath, pkg);
        const crateName = path.basename(cratePath);
        if (!fs.existsSync(pkgPath)) {
          if (isNodeModule) {
            console.error(
              chalk.bold.red('Error: ') +
                `Can't find ${chalk.bold(pkgPath)}, run ${chalk.bold.red(
                  `npm install ${cratePath}`
                )} first`
            );
          } else {
            console.error(
              chalk.bold.red('Error: ') +
                `Can't find ${chalk.bold(pkgPath)}, run ${chalk.bold.red(
                  `wasm-pack build ${cratePath} --target web`
                )} first`
            );
          }
        }
        if (!isNodeModule) {
          // copy pkg generated by wasm-pack to node_modules
          try {
            await fs.copy(pkgPath, path.join('node_modules', crateName));
          } catch (error) {
            this.error(`copy crates failed`);
          }
        }
        // replace default load path with '/assets/xxx.wasm'
        const jsPath = findModuleFilePath(path.join('./node_modules', crateName), '.js')


        /**
         * if use node module and name is '@group/test'
         * cratePath === '@group/test'
         * crateName === 'test'
         */

        const regex = /input = new URL\('(.+)'.+;/g;
        let code = fs.readFileSync(jsPath, { encoding: 'utf-8' });
        code = code.replace(regex, (_match, group1) => {
          return `input = "${path.posix.join(
            config_base,
            config_assetsDir,
            group1
          )}"`;
        });
        fs.writeFileSync(jsPath, code);
      };

      for await (const cratePath of cratePaths) {
        await prepareBuild(cratePath, false);
      }

      for await (const cratePath of modulePaths) {
        await prepareBuild(cratePath, true);
      }
    },

    configureServer({ middlewares }) {
      return () => {
        // send 'root/pkg/xxx.wasm' file to user
        middlewares.use((req, res, next) => {
          if (isString(req.url)) {
            const basename = path.basename(req.url);
            res.setHeader(
              'Cache-Control',
              'no-cache, no-store, must-revalidate'
            );
            const entry = wasmMap.get(basename);
            if (basename.endsWith('.wasm') && entry) {
              res.writeHead(200, { 'Content-Type': 'application/wasm' });
              fs.createReadStream(entry.path).pipe(res);
            } else {
              next();
            }
          }
        });
      };
    },

    buildEnd() {
      // copy xxx.wasm files to /assets/xxx.wasm
      wasmMap.forEach((crate, fileName) => {
        this.emitFile({
          type: 'asset',
          fileName: `assets/${fileName}`,
          source: fs.readFileSync(crate.path)
        });
      });
    }
  };
}

export default vitePluginWasmPack;

// https://github.com/sveltejs/vite-plugin-svelte/issues/214
if (typeof module !== 'undefined') {
  module.exports = vitePluginWasmPack;
  vitePluginWasmPack.default = vitePluginWasmPack;
}
