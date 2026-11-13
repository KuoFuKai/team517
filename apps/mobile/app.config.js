const fs = require('node:fs');
const path = require('node:path');
module.exports = ({ config }) => {
  const environment = process.env.EXPO_PUBLIC_APP_ENV ?? 'LOCAL';
  const preview = environment === 'PREVIEW';
  const localPresentation = environment === 'LOCAL' && process.env.EXPO_PUBLIC_DEMO_SCENARIO === 'maker-day-3';
  const mapsKey = process.env.TEAM517_ANDROID_MAPS_API_KEY;
  if (!['LOCAL', 'development', 'PREVIEW'].includes(environment)) throw new Error('Only LOCAL and PREVIEW builds are enabled.');
  const googleFile = process.env.TEAM517_GOOGLE_SERVICES_FILE || process.env.GOOGLE_SERVICES_JSON || (preview ? './google-services.json' : undefined);
  let firebase;
  if (preview) {
    const google = JSON.parse(fs.readFileSync(path.resolve(__dirname, googleFile), 'utf8'));
    const client = google.client?.find(c => c.client_info?.android_client_info?.package_name === config.android.package);
    if (google.project_info?.project_id !== 'team517-dev' || !client?.api_key?.[0]?.current_key) throw new Error('PREVIEW requires the existing team517-dev Android Firebase app.');
    firebase = { projectId: 'team517-dev', apiKey: client.api_key[0].current_key, appId: client.client_info.mobilesdk_app_id, authDomain: 'team517-dev.firebaseapp.com' };
  }
  return { ...config, name: preview ? 'team517 Preview' : config.name,
    plugins: [...(config.plugins || []), '@react-native-community/datetimepicker', ['expo-notifications', { defaultChannel: 'updates' }], ...(!preview && !localPresentation ? ['expo-dev-client'] : []), './plugins/withNotificationLaunch', './plugins/withLocalPresentationNetwork', ['react-native-maps', { ...(mapsKey ? { androidGoogleMapsApiKey: mapsKey } : {}) }], ['expo-location', { isAndroidBackgroundLocationEnabled: false, isAndroidForegroundServiceEnabled: false, isIosBackgroundLocationEnabled: false }]],
    extra: { ...config.extra, team517MapsConfigured: Boolean(mapsKey), team517Environment: preview ? 'PREVIEW' : 'LOCAL', ...(firebase ? { team517Firebase: firebase } : {}) },
    android: { ...config.android, ...(googleFile ? { googleServicesFile: googleFile } : {}) },
  };
};
