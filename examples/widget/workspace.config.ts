import { defineWorkspace, widgetExtension } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    deploymentTarget: '17.0',
    targets: [
      widgetExtension({
        name: 'AcmeWidget',
        bundleIdentifier: '.widget',
      }),
    ],
  },
});
