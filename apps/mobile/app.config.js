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
  let webClientId = process.env.TEAM517_GOOGLE_WEB_CLIENT_ID;
  const iosGoogleFile = process.env.TEAM517_IOS_GOOGLE_SERVICES_FILE || './GoogleService-Info.plist';
  const hasIosGoogle = fs.existsSync(path.resolve(__dirname, iosGoogleFile));
  if (preview) {
    const google = JSON.parse(fs.readFileSync(path.resolve(__dirname, googleFile), 'utf8'));
    const client = google.client?.find(c => c.client_info?.android_client_info?.package_name === config.android.package);
    if (google.project_info?.project_id !== 'team517-dev' || !client?.api_key?.[0]?.current_key) throw new Error('PREVIEW requires the existing team517-dev Android Firebase app.');
    firebase = { projectId: 'team517-dev', apiKey: client.api_key[0].current_key, appId: client.client_info.mobilesdk_app_id, authDomain: 'team517-dev.firebaseapp.com' };
    webClientId ||= client.oauth_client?.find(c => c.client_type === 3)?.client_id;
  }
  return { ...config, name: preview ? 'team517 Preview' : config.name,
    plugins: [...(config.plugins || []), 'expo-apple-authentication', '@react-native-firebase/app', '@react-native-firebase/messaging', ['expo-build-properties',{ios:{useFrameworks:'static'}}], ['react-native-nitro-google-signin', {...(hasIosGoogle?{iosGoogleServicesFile:iosGoogleFile}:{})}], '@react-native-community/datetimepicker', ['expo-notifications', { defaultChannel: 'updates' }], ...(!preview && !localPresentation ? ['expo-dev-client'] : []), './plugins/withNotificationLaunch', './plugins/withLocalPresentationNetwork', ['react-native-maps', { ...(mapsKey ? { androidGoogleMapsApiKey: mapsKey } : {}) }], ['expo-location', { locationAlwaysPermission:false, locationAlwaysAndWhenInUsePermission:false, locationWhenInUsePermission:'Your location helps center nearby task areas. It is not shared with other users.', isAndroidBackgroundLocationEnabled: false, isAndroidForegroundServiceEnabled: false, isIosBackgroundLocationEnabled: false }]],
    extra: { ...config.extra, team517IosPushEnabled: process.env.TEAM517_IOS_PUSH_ENABLED==='true', team517MapsConfigured: Boolean(mapsKey), team517Environment: preview ? 'PREVIEW' : 'LOCAL', ...(webClientId?{team517GoogleClientId:webClientId}:{}), ...(firebase ? { team517Firebase: firebase } : {}) },
    ios: {...config.ios, bundleIdentifier:'edu.cornelltech.team517', usesAppleSignIn:true, supportsTablet:false, buildNumber:'2', ...(hasIosGoogle?{googleServicesFile:iosGoogleFile}:{})},
    android: { ...config.android, ...(googleFile ? { googleServicesFile: googleFile } : {}) },
  };
};
