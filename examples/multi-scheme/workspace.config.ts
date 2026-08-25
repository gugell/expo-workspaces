import { defineWorkspace, scheme } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    schemes: [
      scheme({ name: 'Development', configuration: 'Debug' }),
      scheme({ name: 'Production', configuration: 'Release' }),
    ],
  },
});
