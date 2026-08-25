import { defineWorkspace, swiftPackage } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    packages: [
      swiftPackage({
        url: 'https://github.com/apple/swift-collections',
        requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.0' },
        products: ['Collections'],
      }),
    ],
    pods: [{ pod: 'Alamofire', version: '~> 5.9' }],
  },
});
