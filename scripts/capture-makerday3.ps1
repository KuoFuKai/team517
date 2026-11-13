param(
  [Parameter(Mandatory=$true)]
  [ValidateSet('01-care-context','02-post-request','03-helper-responses','04-choose-helper','05-confirmation','06-scheduled','07-progress','08-completion')]
  [string]$Name,
  [string]$Serial='emulator-5554'
)
$ErrorActionPreference='Stop'
$repoRoot=Split-Path $PSScriptRoot -Parent
$sdk=if($env:ANDROID_HOME){$env:ANDROID_HOME}else{Join-Path $env:LOCALAPPDATA 'Android/Sdk'}
$adb=Join-Path $sdk 'platform-tools/adb.exe'
if((& $adb -s $Serial get-state) -ne 'device'){throw 'A booted Android target is required.'}
$ime=& $adb -s $Serial shell dumpsys input_method
if($ime -match 'mInputShown=true'){throw 'Dismiss the keyboard before capturing.'}
$tempDir=Join-Path $repoRoot '.tools/maker-day3'
$outputDir=Join-Path $repoRoot 'artifacts/maker-day-3-screenshots'
New-Item -ItemType Directory -Force $tempDir,$outputDir | Out-Null
& $adb -s $Serial shell screencap -p /sdcard/team517-makerday3.png
if($LASTEXITCODE -ne 0){throw 'Android capture failed.'}
$raw=Join-Path $tempDir 'capture.png'
& $adb -s $Serial pull /sdcard/team517-makerday3.png $raw | Out-Null
if($LASTEXITCODE -ne 0){throw 'Android screenshot transfer failed.'}
Add-Type -AssemblyName System.Drawing
$bitmap=[System.Drawing.Bitmap]::FromFile($raw)
try {
  if($bitmap.Width -ne 1170 -or $bitmap.Height -ne 2760){throw 'Expected the documented 1170x2760 capture viewport. No image was resized.'}
  # Only system bars are cropped. Application pixels are never retouched.
  $crop=$bitmap.Clone([System.Drawing.Rectangle]::new(0,156,1170,2532),$bitmap.PixelFormat)
  try {$crop.Save((Join-Path $outputDir "$Name.png"),[System.Drawing.Imaging.ImageFormat]::Png)} finally {$crop.Dispose()}
} finally {$bitmap.Dispose()}
Write-Output "Captured $Name.png (1170x2532; 390x844 at 3x). Inspect loading, clipping and state before accepting it."
