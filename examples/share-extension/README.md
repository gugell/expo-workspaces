# Share Extension example

Minimal Expo app that declares a Share Extension in `workspace.config.ts`.

```sh
pnpm install
pnpm exec expo-workspaces plan
npx expo prebuild
```

After prebuild, Xcode contains a `ShareExtension` target whose sources live in `targets/ShareExtension/`. The generated `ios/` directory is disposable — the config is the source of truth.
