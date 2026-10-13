#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/android-env.sh
export NODE_ENV=production
export CI=1
signing_dir="$HOME/.local/share/chess69/signing"
test -s "$signing_dir/release.p12" && test -s "$signing_dir/password"
build_tools="$ANDROID_HOME/build-tools/36.0.0"
version="$(node -p "require('./app.json').expo.version")"
version_code="$(node -p "require('./app.json').expo.android.versionCode")"
mkdir -p artifacts
output="artifacts/chess69-${version}-${version_code}-arm64.apk"
temporary_dir="$(mktemp -d "${TMPDIR:-/tmp}/chess69-build.XXXXXX")"
trap 'rm -rf "$temporary_dir"' EXIT
# The committed native project is maintained deliberately. Do not prebuild --clean.
(cd android && ./gradlew :app:assembleRelease --no-daemon --console=plain --max-workers=4 -PreactNativeArchitectures=arm64-v8a)
"$build_tools/zipalign" -P 16 -f 4 android/app/build/outputs/apk/release/app-release-unsigned.apk "$temporary_dir/aligned.apk"
"$build_tools/apksigner" sign --ks "$signing_dir/release.p12" \
  --ks-key-alias chess69-release --ks-pass "file:$signing_dir/password" \
  --out "$temporary_dir/signed.apk" "$temporary_dir/aligned.apk" </dev/null
python3 scripts/verify-apk.py "$temporary_dir/signed.apk"
mv "$temporary_dir/signed.apk" "$output"
rm -f "$temporary_dir/signed.apk.idsig"
python3 scripts/verify-apk.py "$output" --metadata "${output%.apk}.json"
