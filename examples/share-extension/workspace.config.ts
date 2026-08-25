import { shareExtension, defineWorkspace } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    deploymentTarget: '16.4',
    targets: [
      shareExtension({
        name: 'ShareExtension',
        bundleIdentifier: '.share',
        entitlements: {
          'com.apple.security.application-groups': ['group.com.acme.shareexample'],
        },
      }),
    ],
  },
});
