# Sharing team517 through GitHub

Use a **private repository** for the current internal Product Studio project. Upload source, tests, documentation, package manifests/lockfile and the credential-free CI workflow. Native acceptance screenshots under `docs/native-evidence/` are intentional documentation assets with synthetic demo content.

## Files that stay local

- External Firebase Admin/ADC JSON: backend-only; never copy it into the repository or mobile build.
- `.tools/`: local SDK/JDK, logs, emulator fixtures and `preview-credentials.json` containing synthetic Preview passwords.
- `apps/mobile/google-services.json`: locally supplied public Android Firebase client configuration, deliberately excluded here.
- `.env` / `.env.*`: actual environment values, including `functions/.env.team517-dev`. Only `.env.example` is included.
- Signing keys/certificates, local package-manager credentials, generated Android/iOS projects and dependency/build directories.
- `artifacts/`, APK/AAB files, local archives (including `docs.7z`) and diagnostic logs.

Share the Preview APK separately with intended testers. Do not attach the private login receipt or Admin JSON to a GitHub issue, release or repository archive. `.firebaserc`, Firebase rules/indexes and public project/package identifiers are normal project configuration; they are not Admin credentials. LOCAL tests use demo-team517 emulators, not cloud credentials.

## Before each push

Inspect `git status`, `git diff --cached --stat` and the staged diff. `.gitignore` does not untrack a file that was committed earlier. If a credential is ever committed, stop publication, rotate the affected credential and address Git history; merely deleting its latest copy is insufficient.

On November 12, 2026 this workspace was initialized on `main`. A local preflight scanned upload candidates for private-key blocks, service-account JSON, common GitHub/npm/AWS/Google API key patterns and the actual generated Preview passwords; no matches were found. This is a scoped text scan, not a guarantee that all possible secret formats or image contents are detected. Local tooling/report files remain ignored. No remote repository, GitHub visibility setting or hosted Actions result is implied by this local preparation.

## After cloning

Use Node 22 / Java 21 and the existing README workflow: `npm ci`, then the credential-free LOCAL checks/emulators. Copy environment examples only when needed. Obtain Android client configuration and any authorized backend ADC separately through a private channel. A clone deliberately does not contain an installed SDK, signing material, Preview passwords or a ready-built APK.

Cloud deployment continues to use Firebase CLI Google-user login; runtime Admin/FCM ADC is separate. Never add the Admin credential as a mobile environment variable or GitHub secret merely to run the existing LOCAL CI job.
