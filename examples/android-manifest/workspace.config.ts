import { androidFeature, defineWorkspace } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  android: {
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    features: [
      androidFeature('android.hardware.camera', false),
      androidFeature('android.hardware.microphone'),
      {
        name: 'android.hardware.opengles.aep',
        required: false,
        glEsVersion: '0x00030000',
      },
    ],
    applicationAttributes: {
      'android:largeHeap': 'true',
      'android:hardwareAccelerated': 'true',
      'android:usesCleartextTraffic': 'false',
    },
  },
});
