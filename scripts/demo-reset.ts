// Deliberately destructive LOCAL demo reset. No configurable cloud project/host.
async function main() {
  if (process.argv[2] !== '--local-demo-only') throw new Error('Use npm run demo:reset.');
  for (const url of [
    'http://127.0.0.1:9199/emulator/v1/projects/demo-team517/accounts',
    'http://127.0.0.1:8280/emulator/v1/projects/demo-team517/databases/(default)/documents',
  ]) {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Local emulator reset failed (${response.status}).`);
  }
  console.log('Cleared only demo-team517 Auth/Firestore emulators. Sign in again on the app.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
