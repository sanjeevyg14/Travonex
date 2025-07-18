#!/usr/bin/env bash
set -euo pipefail

# Ensure apt repositories are up to date
sudo apt-get update

# Install Node.js 20 if not already present
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install OpenSSL 1.1 libraries required for mongodb-memory-server
if ! ldconfig -p | grep -q libssl.so.1.1; then
  echo "Installing libssl1.1 for mongodb-memory-server" >&2
  wget -qO /tmp/libssl1.1.deb http://archive.ubuntu.com/ubuntu/pool/main/o/openssl1.1/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
  sudo dpkg -i /tmp/libssl1.1.deb
fi

# Install project dependencies
npm install
(cd backend && npm install)

echo "Setup complete. You can now run npm test."
