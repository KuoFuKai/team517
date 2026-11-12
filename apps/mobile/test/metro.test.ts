import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

test('Metro excludes transient native compiler trees while retaining JS package builds', () => {
  const require = createRequire(import.meta.url);
  const config = require('../metro.config.js');
  const blocked = (path: string) => config.resolver.blockList.some((rule: RegExp) => rule.test(path));
  assert.equal(blocked('E:\\repo\\node_modules\\expo-modules-core\\android\\.cxx\\Debug\\CMakeFiles\\CMakeTmp\\CMakeFiles'), true);
  assert.equal(blocked('/repo/apps/mobile/android/.gradle/9.0.0/checksums'), true);
  assert.equal(blocked('E:\\repo\\node_modules\\expo-notifications\\build\\index.js'), false);
  assert.equal(blocked('/repo/apps/mobile/src/push/native.ts'), false);
});
