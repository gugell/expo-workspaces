// Bundles the meta package + all @expo-workspaces/* capabilities into a single
// self-contained CJS module at ./build, so the repo root is installable as
// `expo-workspaces` straight from git (no workspace: deps at runtime).
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import * as esbuild from 'esbuild';

const ROOT = new URL('..', import.meta.url).pathname;
process.chdir(ROOT);

// Third-party deps stay external (installed by the consumer via deps/peers).
const external = [
  '@expo/config-plugins',
  '@expo/config-plugins/*',
  '@expo/config',
  '@expo/config/*',
  'expo',
  'expo/*',
  '@bacons/xcode',
  '@bacons/xcode/*',
  '@expo/plist',
  '@expo/plist/*',
  'jiti',
];

mkdirSync('build', { recursive: true });

const shared = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  external,
  logLevel: 'info',
};

// 1. Runtime bundle — follows the meta's requires into each capability's build/.
await esbuild.build({
  ...shared,
  entryPoints: ['packages/expo-workspaces/build/index.js'],
  outfile: 'build/index.js',
});

await esbuild.build({
  ...shared,
  entryPoints: ['packages/expo-workspaces/build/cli.js'],
  outfile: 'build/cli.js',
});

// 2. Types — ship the curated, self-contained declarations (the manifest surface
//    is stable and free of @bacons/xcode / @expo/config-plugins type graphs).
copyFileSync('dist-types/index.d.ts', 'build/index.d.ts');
copyFileSync('dist-types/types.d.ts', 'build/types.d.ts');
// `expo-workspaces/types` is type-only; ship a runtime stub for the export map.
writeFileSync('build/types.js', 'module.exports = {};\n');

console.log('bundled → build/{index.js, cli.js, index.d.ts, types.d.ts, types.js}');
