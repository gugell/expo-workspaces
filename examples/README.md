# Examples

Example apps are pnpm workspace packages. From a clean clone:

```sh
pnpm install
node bin/expo-workspaces.js --project examples/android-gradle plan
# or: pnpm --filter android-gradle-example plan
```

| Example | What it shows |
| --- | --- |
| [share-extension](share-extension) | Share Extension + App Groups |
| [widget](widget) | WidgetKit extension target |
| [native-dependencies](native-dependencies) | SPM + CocoaPods |
| [multi-scheme](multi-scheme) | Shared Xcode schemes |
| [android-gradle](android-gradle) | SDK, gradle.properties, structured deps, env signing |
| [android-manifest](android-manifest) | permissions, uses-feature, application attributes |

Shared Expo/React versions live in the root [pnpm catalog](../pnpm-workspace.yaml). `expo-workspaces` is linked with `workspace:*`.
