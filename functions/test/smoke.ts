import assert from 'node:assert/strict';
async function main() {
  const base='http://127.0.0.1:5001/demo-team517/us-central1/api/api/v1';
  const health=await fetch(base+'/health');
  assert.equal(health.status,200);
  assert.equal((await health.json()).status,'ok');
  assert.equal((await fetch(base+'/me')).status,401);
  console.log('Functions v2 HTTP smoke: health 200 and protected route 401 passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
