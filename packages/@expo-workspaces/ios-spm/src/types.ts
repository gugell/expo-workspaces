/** Version requirement for a remote Swift package (mirrors Xcode's model). */
export type SwiftPackageRequirement =
  | { kind: 'upToNextMajorVersion'; minimumVersion: string }
  | { kind: 'upToNextMinorVersion'; minimumVersion: string }
  | { kind: 'versionRange'; minimumVersion: string; maximumVersion: string }
  | { kind: 'exactVersion'; version: string }
  | { kind: 'branch'; branch: string }
  | { kind: 'revision'; revision: string };

export interface SpmRemotePackage {
  /** Repository URL, e.g. "https://github.com/apple/swift-collections". */
  url: string;
  requirement: SwiftPackageRequirement;
  /** Product names to link (e.g. ["Collections"]). */
  products: string[];
  /** Target name to attach products to. Defaults to the main app target. */
  target?: string;
}

export interface SpmLocalPackage {
  /** Path to the local package relative to the Xcode project (ios/). */
  path: string;
  products: string[];
  target?: string;
}

/** The manifest slice this package consumes. */
export interface IosSpmManifest {
  swiftPackages?: {
    remote?: SpmRemotePackage[];
    local?: SpmLocalPackage[];
  };
}
