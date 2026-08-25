# Android config example

Application-level Android intent: SDK versions, a permission, gradle.properties, and signing via environment variables.

```sh
export EXPO_WORKSPACE_RELEASE_STORE_PASSWORD=secret
export EXPO_WORKSPACE_RELEASE_KEY_PASSWORD=secret
pnpm install
pnpm exec expo-workspaces plan
npx expo prebuild --platform android
```

`plan` and `doctor` redact password fields. Literal passwords in git will warn.
