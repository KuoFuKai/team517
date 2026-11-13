$ErrorActionPreference='Stop'
$repoRoot=Split-Path $PSScriptRoot -Parent
Push-Location $repoRoot
try {
  $nodeDirectory=Join-Path $repoRoot '.tools/node22/node-v22.23.4-win-x64'
  if(Test-Path $nodeDirectory){$env:PATH=$nodeDirectory+';'+$env:PATH}
  if((node --version) -notmatch '^v22\.') {throw 'Use Node 22.'}
  if(-not $env:JAVA_HOME){$env:JAVA_HOME=Join-Path $repoRoot '.tools/jdk21/jdk-21.0.13+9'}
  if(-not $env:ANDROID_HOME){$env:ANDROID_HOME=(Join-Path $env:LOCALAPPDATA 'Android/Sdk')}
  $env:PATH=(Join-Path $env:JAVA_HOME 'bin')+';'+$env:PATH
  foreach($key in @('GOOGLE_APPLICATION_CREDENTIALS','EXPO_PUBLIC_DEV_HOST','EXPO_PUBLIC_API_URL','EXPO_PUBLIC_AUTH_EMULATOR_URL','EXPO_PUBLIC_FIREBASE_API_KEY','EXPO_PUBLIC_FIREBASE_PROJECT_ID','EXPO_PUBLIC_FIREBASE_APP_ID','EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN')){Remove-Item "Env:$key" -ErrorAction SilentlyContinue}
  $env:EXPO_PUBLIC_APP_ENV='LOCAL'; $env:EXPO_PUBLIC_DEV_HOST='10.0.2.2'; $env:EXPO_PUBLIC_DEMO_SCENARIO='maker-day-3'; $env:EXPO_NO_TELEMETRY='1'; $env:EXPO_NO_DOTENV='1'
  $env:TEAM517_GOOGLE_SERVICES_FILE=(Resolve-Path 'apps/mobile/google-services.json').Path
  $env:__UNSAFE_EXPO_HOME_DIRECTORY=Join-Path $repoRoot '.tools/expo'
  npm run build
  if($LASTEXITCODE -ne 0){throw 'Shared build failed.'}
  Push-Location apps/mobile
  try {
    npx expo prebuild --platform android --no-install
    if($LASTEXITCODE -ne 0){throw 'Local presentation prebuild failed.'}
    Push-Location android
    try {
      & ./gradlew.bat --init-script ../../../scripts/gradle-foojay.init.gradle :app:assembleRelease '-PreactNativeArchitectures=arm64-v8a,x86_64' --max-workers=2 --console=plain
      if($LASTEXITCODE -ne 0){throw 'Standalone release-variant build failed.'}
    } finally {Pop-Location}
  } finally {Pop-Location}
  New-Item -ItemType Directory -Force artifacts/android | Out-Null
  Copy-Item -LiteralPath apps/mobile/android/app/build/outputs/apk/release/app-release.apk -Destination artifacts/android/team517-maker-day3.apk
  node -e "const fs=require('node:fs'),c=require('node:crypto');console.log('SHA256 '+c.createHash('sha256').update(fs.readFileSync(process.argv[1])).digest('hex'));" artifacts/android/team517-maker-day3.apk
} finally {Pop-Location}
