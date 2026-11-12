import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { checkPreview } from './preview-check';
async function main() {
  if (!(await checkPreview())) throw new Error('Cloud prerequisites are not ready. No deployment or automatic API/billing activation attempted.');
  const file = 'functions/.env.team517-dev';
  if (!existsSync(file)) writeFileSync(file, 'PUSH_PROVIDER=fcm\nFCM_PROJECT_ID=team517-dev\nAI_PROVIDER=disabled\n');
  const env = readFileSync(file, 'utf8');
  if (/GOOGLE_APPLICATION_CREDENTIALS|AI_PROVIDER\s*=\s*mock/.test(env) || !/^FCM_PROJECT_ID=team517-dev$/m.test(env) || !/^PUSH_PROVIDER=fcm$/m.test(env)) throw new Error('Preview backend env must use runtime ADC, team517-dev FCM and no cloud mock AI.');
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['firebase', 'deploy', '--project', 'team517-dev', '--only', 'firestore:rules,firestore:indexes,functions:api,functions:deliverNotification', '--non-interactive'], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) throw new Error('Preview deployment did not complete.');
}
main().catch(error => { console.error((error as Error).message); process.exitCode = 1; });
