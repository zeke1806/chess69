#!/usr/bin/env python3
"""Create the release identity once. Never replace an existing private key."""
import hashlib
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import tempfile


def main():
    os.umask(0o077)
    root = Path(__file__).resolve().parents[1]
    signing = Path.home() / '.local/share/chess69/signing'
    backup = Path.home() / 'Library/Application Support/Chess69/signing-recovery'
    if signing.exists() or backup.exists() or (root / 'docs/android-signing-certificate.sha256').exists():
        raise SystemExit('Signing storage already exists. Use the recovery procedure; never regenerate it.')
    java = subprocess.check_output(['brew', '--prefix', 'openjdk@17'], text=True).strip()
    keytool = str(Path(java) / 'bin/keytool')
    signing.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='signing-', dir=signing.parent) as temporary:
        staging = Path(temporary)
        password = staging / 'password'
        password.write_text(secrets.token_urlsafe(48) + '\n')
        subprocess.run([
            keytool, '-genkeypair', '-keystore', str(staging / 'release.p12'),
            '-storetype', 'PKCS12', '-alias', 'chess69-release',
            '-storepass:file', str(password), '-keypass:file', str(password),
            '-keyalg', 'RSA', '-keysize', '4096', '-validity', '10000',
            '-dname', 'CN=Chess69, O=Chess69', '-noprompt',
        ], check=True)
        certificate = subprocess.check_output([
            keytool, '-exportcert', '-keystore', str(staging / 'release.p12'),
            '-alias', 'chess69-release', '-storepass:file', str(password),
        ])
        fingerprint = hashlib.sha256(certificate).hexdigest()
        (staging / 'certificate.sha256').write_text(fingerprint + '\n')
        shutil.copytree(staging, signing)
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(signing, backup)
    for folder in (signing, backup):
        folder.chmod(0o700)
        for path in folder.iterdir():
            path.chmod(0o600)
    for path in signing.iterdir():
        if path.read_bytes() != (backup / path.name).read_bytes():
            raise SystemExit('Recovery copy does not match')
    (root / 'docs/android-signing-certificate.sha256').write_text(fingerprint + '\n')
    print('Release identity created; protected recovery copy verified. Public SHA-256: ' + fingerprint)


if __name__ == '__main__':
    main()
