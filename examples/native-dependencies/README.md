# Native dependencies example

Declares a remote Swift package and a CocoaPod without custom targets.

```sh
pnpm install
pnpm exec expo-workspaces plan
npx expo prebuild
```

After prebuild, the app target links `Collections` via SPM and `Alamofire` via the Podfile.
