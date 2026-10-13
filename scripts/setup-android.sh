#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
brew install openjdk@17
brew install --cask android-commandlinetools
source scripts/android-env.sh
sdkmanager="$(brew --prefix)/share/android-commandlinetools/cmdline-tools/latest/bin/sdkmanager"
mkdir -p "$ANDROID_HOME"
# yes may exit with SIGPIPE after sdkmanager has accepted the last license.
set +o pipefail
yes | "$sdkmanager" --sdk_root="$ANDROID_HOME" --licenses >/dev/null
license_status=${PIPESTATUS[1]}
set -o pipefail
test "$license_status" -eq 0
"$sdkmanager" --sdk_root="$ANDROID_HOME" \
  'platform-tools' 'platforms;android-36' 'build-tools;36.0.0' 'build-tools;35.0.0' \
  'ndk;27.1.12297006' 'cmake;3.22.1'
java -version
