import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
test('Preview build uses public Firebase config without dev-client plugin or backend credentials', () => {
  const appConfig = require('../app.config.js');
  const dir = mkdtempSync(join(tmpdir(), 'team517-preview-')), file = join(dir, 'google-services.json');
  const keys = ['EXPO_PUBLIC_APP_ENV', 'TEAM517_GOOGLE_SERVICES_FILE', 'GOOGLE_APPLICATION_CREDENTIALS'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    writeFileSync(file, JSON.stringify({ project_info: { project_id: 'team517-dev' }, client: [{ client_info: { android_client_info: { package_name: 'edu.cornelltech.team517' }, mobilesdk_app_id: 'public-app-id' }, api_key: [{ current_key: 'public-client-key' }] }] }));
    process.env.EXPO_PUBLIC_APP_ENV = 'PREVIEW'; process.env.TEAM517_GOOGLE_SERVICES_FILE = file;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'BACKEND_ONLY_SENTINEL';
    const base = { name: 'team517 Development', android: { package: 'edu.cornelltech.team517' } };
    const preview = appConfig({ config: base });
    assert.equal(preview.name, 'team517 Preview'); assert.equal(preview.android.package, base.android.package);
    assert.ok(!preview.plugins.includes('expo-dev-client')); assert.ok(!JSON.stringify(preview).includes('BACKEND_ONLY_SENTINEL'));
    assert.deepEqual(Object.keys(preview.extra.team517Firebase).sort(), ['apiKey', 'appId', 'authDomain', 'projectId']);
    process.env.EXPO_PUBLIC_APP_ENV = 'LOCAL'; assert.ok(appConfig({ config: base }).plugins.includes('expo-dev-client'));
    process.env.EXPO_PUBLIC_APP_ENV = 'PRODUCTION'; assert.throws(() => appConfig({ config: base }));
  } finally {
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
    unlinkSync(file); rmdirSync(dir);
  }
});
const { addNotificationLaunchHandlers } = require('../plugins/withNotificationLaunch');
const template = `class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme)
    super.onCreate(null)
  }
  fun existingBehavior() = "preserved"
}`;

test('native prebuild preserves cold and restored-activity notification intents and remains idempotent', () => {
  const config = { modResults: { language: 'kt', contents: template }, unrelated: 'preserved' };
  const generated = addNotificationLaunchHandlers(config);
  const source = generated.modResults.contents;
  assert.equal(generated.unrelated, 'preserved');
  assert.ok(source.includes('fun existingBehavior() = "preserved"'));
  assert.ok(source.includes('captureNotificationIntent(intent)\n    super.onCreate(null)'));
  assert.ok(source.includes('captureNotificationIntent(intent)\n    super.onNewIntent(intent)'));
  assert.ok(source.includes('getNotificationResponseFromBroadcastIntent(launchIntent)'));
  assert.ok(source.includes('extras.containsKey("google.message_id")'));
  assert.equal(addNotificationLaunchHandlers(generated).modResults.contents, source);
});

test('native notification integration fails clearly when the generated lifecycle template changes', () => {
  assert.throws(() => addNotificationLaunchHandlers({ modResults: { language: 'java', contents: template } }), /SDK 55 Kotlin/);
  assert.throws(() => addNotificationLaunchHandlers({ modResults: { language: 'kt', contents: template.replace('class MainActivity : ReactActivity()', 'class ChangedActivity') } }), /MainActivity/);
  assert.throws(() => addNotificationLaunchHandlers({ modResults: { language: 'kt', contents: template + '\noverride fun onNewIntent(intent: Intent) {}' } }), /MainActivity/);
});
