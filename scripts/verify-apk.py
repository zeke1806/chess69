#!/usr/bin/env python3
"""Verify the distributable contract with Android tools, then record public metadata."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import zipfile


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('apk', type=Path)
    parser.add_argument('--metadata', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    config = json.loads((root / 'app.json').read_text())['expo']
    tools = Path(os.environ['ANDROID_HOME']) / 'build-tools/36.0.0'
    signature = subprocess.check_output([str(tools / 'apksigner'), 'verify', '--verbose', '--print-certs', str(args.apk)], text=True)
    certificate = re.search(r'Signer #1 certificate SHA-256 digest: ([a-f0-9]+)', signature)
    expected = (root / 'docs/android-signing-certificate.sha256').read_text().strip()
    require(certificate is not None and certificate[1] == expected, 'Unexpected signing certificate')
    badging = subprocess.check_output([str(tools / 'aapt'), 'dump', 'badging', str(args.apk)], text=True)
    package = re.search(r"package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'", badging)
    require(package is not None, 'Missing package identity')
    require(package[1] == config['android']['package'], 'Wrong package ID')
    require(package[2] == str(config['android']['versionCode']), 'Wrong version code')
    require(package[3] == config['version'], 'Wrong version name')
    require("application-label:'Chess69'" in badging, 'Wrong launcher label')
    require('application-debuggable' not in badging, 'Debuggable APK is forbidden')
    require("native-code: 'arm64-v8a'" in badging, 'ARM64 build required')
    minimum = re.search(r"sdkVersion:'(\d+)'", badging)
    require(minimum is not None and int(minimum[1]) <= 31, 'Incompatible with Galaxy S22 Android 12 or later')
    permissions = subprocess.check_output([str(tools / 'aapt'), 'dump', 'permissions', str(args.apk)], text=True)
    require('android.permission.INTERNET' not in permissions, 'A local-only release must not request Internet access')
    manifest = subprocess.check_output([str(tools / 'aapt'), 'dump', 'xmltree', str(args.apk), 'AndroidManifest.xml'], text=True)
    require(re.search(r'android:allowBackup[^\n]*0x0\b', manifest) is not None, 'Android backup must be disabled')
    require('android:fullBackupContent' in manifest and 'android:dataExtractionRules' in manifest, 'Explicit backup and device-transfer exclusions required')
    with zipfile.ZipFile(args.apk) as archive:
        require(archive.getinfo('assets/index.android.bundle').file_size > 1000, 'Missing embedded JS bundle')
        require('lib/arm64-v8a/libhermesvm.so' in archive.namelist(), 'Missing embedded Hermes engine')
        require(archive.getinfo('lib/arm64-v8a/libchess69_stockfish.so').file_size > 75000000, 'Missing native Stockfish and embedded NNUE')
        require(archive.getinfo('lib/arm64-v8a/libexpo-sqlite.so').file_size > 1000000, 'Missing native SQLite')
        require(not any(name.endswith(('.p12', '.jks', '.keystore')) for name in archive.namelist()), 'Signing key in APK')
    subprocess.run([str(tools / 'zipalign'), '-c', '-P', '16', '4', str(args.apk)], check=True, stdout=subprocess.DEVNULL)
    metadata = {
        'file': args.apk.name, 'package': package[1], 'version': package[3],
        'versionCode': int(package[2]), 'minSdk': int(minimum[1]), 'abi': 'arm64-v8a',
        'bytes': args.apk.stat().st_size, 'sha256': sha256(args.apk),
        'certificateSha256': expected, 'stockfish': '17.1', 'sqlite': True,
        'internetPermission': False, 'androidBackup': False,
    }
    if args.metadata:
        args.metadata.write_text(json.dumps(metadata, indent=2) + '\n')
    print(json.dumps(metadata, indent=2))


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


if __name__ == '__main__':
    main()
