# iOS native targets & their sources

`@expo-workspaces/ios-targets` synthesizes iOS app‑extension targets (share / widget / clip) directly into the Xcode project during `expo prebuild` — a first‑party replacement for `@bacons/apple-targets`, reusing the `@bacons/xcode` parser under the hood.

A target has **two halves**:

1. **Declarative config** → the manifest's `targets[]`.
2. **Source files** → a folder on disk under `targetsRoot` (default `./targets`).

## 1. Declare it

```js
/** @type {import('expo-workspaces/types').WorkspaceManifest} */
module.exports = {
  manifestVersion: 1,
  // targetsRoot: './targets', // default
  targets: [
    {
      name: 'ShareExtension',            // = folder name AND Xcode target name
      type: 'share',                     // 'share' | 'widget' | 'clip'
      bundleIdentifier: '.ShareExtension', // leading "." → <appId>.ShareExtension
      deploymentTarget: '16.4',          // optional (default 18.0)
      entitlements: {                    // optional → generated.entitlements
        'com.apple.security.application-groups': ['group.com.example.app'],
      },
      // frameworks: ['Intents'],        // extras (type pulls its own defaults)
      // buildSettings: { ENABLE_APP_INTENTS_METADATA_GENERATION: 'NO' },
      // source: 'targets/ShareExtension', // override; defaults to `${targetsRoot}/${name}`
    },
  ],
};
```

## 2. Add the source folder

```
targets/ShareExtension/
├─ ShareViewController.swift   ← compiled into the target
├─ Info.plist                  ← auto-generated per type if missing; yours is preserved
├─ generated.entitlements      ← (re)written from manifest `entitlements`
└─ pods.rb                     ← the target's CocoaPods deps
```

How each piece is handled:

- **Swift / storyboards / asset catalogs** — the generator attaches an Xcode **file‑system‑synchronized group** to `targets/<name>/`, so Xcode auto‑includes everything there. No per‑file registration, no manual `project.pbxproj` edits.
- **`Info.plist`** — written **only if absent** (per‑type template). Commit your own to customize (e.g. a Share extension's `NSExtensionActivationRule`); it's left untouched.
- **entitlements** — declared in the manifest → serialized to `generated.entitlements`, with `CODE_SIGN_ENTITLEMENTS` + `REGISTER_APP_GROUPS` set. If you commit a differently‑named `*.entitlements`, it's detected and reused. For all three types, app groups are inherited from the app when you don't declare any.
- **`pods.rb`** — the target's pods. The generator appends a loader to the Podfile (`Dir.glob('targets/**/pods.rb')`) that evaluates each file inside a `target '<name>' do … end` block.
- **`expo-target.config.js`** — **not used for config** (that moved to the manifest). It's only excluded from target membership; you can delete it.

## Build settings

Use `buildSettings` to set per‑target Xcode build settings (applied to Debug + Release, overriding the generated defaults). Common case — preventing a duplicate App Intents metadata producer between the app and an extension:

```js
{
  name: 'ShareExtension', type: 'share',
  buildSettings: {
    ENABLE_APP_INTENTS_METADATA_GENERATION: 'NO',
    OTHER_SWIFT_FLAGS: '$(inherited) -Xfrontend -disable-autolink-framework -Xfrontend AppIntents',
  },
}
```

## What the generator does for you

For each target it: creates the `PBXNativeTarget` (with the right product type), a Debug+Release configuration list, empty Sources/Resources phases; embeds the `.appex`/`.app` into the app's "Embed Foundation Extensions" phase; adds the target dependency; wires the file‑system‑synchronized group; sets `DEVELOPMENT_TEAM`, `MARKETING_VERSION`, and (for share/clip) `ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES` on the app; and registers the extension for EAS managed code‑signing via `extra.eas.build.experimental.ios.appExtensions`.

## Add another target (e.g. a widget)

1. Add `{ name: 'MyWidget', type: 'widget', bundleIdentifier: '.MyWidget' }` to `targets[]`.
2. Create `targets/MyWidget/` with your WidgetKit `*.swift`. Add `pods.rb` only if it needs pods; add `Info.plist`/entitlements only to override the generated ones.
3. `expo prebuild` — the widget is synthesized (WidgetKit/SwiftUI frameworks come from the type registry), embedded, pods wired, and registered for EAS signing.
