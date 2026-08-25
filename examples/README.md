# Examples

Each app is independently installable. From a clean clone:

```sh
pnpm install   # repo root — builds the plugin
cd examples/share-extension
pnpm install
pnpm exec expo-workspaces plan
npx expo prebuild
```

| Example | What it shows |
| --- | --- |
| [share-extension](share-extension) | Share Extension + App Groups |
| [widget](widget) | WidgetKit extension target |
| [native-dependencies](native-dependencies) | SPM + CocoaPods |
| [multi-scheme](multi-scheme) | Shared Xcode schemes |
| [android-config](android-config) | SDK, permissions, env-based signing |

Run `expo-workspaces plan` from the repo against an example without installing Expo in the example:

```sh
node bin/expo-workspaces.js --project examples/share-extension plan
```
