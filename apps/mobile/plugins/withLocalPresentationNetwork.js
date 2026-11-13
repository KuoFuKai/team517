// Explicitly enabled only for the LOCAL Maker Day standalone build.
// PREVIEW keeps HTTPS-only platform defaults.
const { withAndroidManifest } = require('expo/config-plugins');
module.exports = config => withAndroidManifest(config, result => {
  result.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = process.env.EXPO_PUBLIC_APP_ENV === 'LOCAL' && process.env.EXPO_PUBLIC_DEMO_SCENARIO === 'maker-day-3' ? 'true' : 'false';
  return result;
});
