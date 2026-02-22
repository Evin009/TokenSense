#!/bin/bash
# TokenSense — Vultr Server Setup
# Run this script after SSH-ing into a fresh Ubuntu 22.04 VPS.
# Usage: bash setup-vultr.sh
set -e

echo "=== TokenSense — Vultr Server Setup ==="

# 1. Install Docker
echo "[1/4] Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 2. Install Docker Compose plugin
echo "[2/4] Installing Docker Compose plugin..."
apt-get update -q && apt-get install -y -q docker-compose-plugin

# 3. Clone the repo
echo "[3/4] Cloning repository..."
git clone https://github.com/yourusername/TokenSense.git /opt/tokensense
cd /opt/tokensense

# 4. Create .env from template
echo "[4/4] Setting up environment..."
cp .env.example .env

echo ""
echo "============================================"
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Edit /opt/tokensense/.env with your real API keys:"
echo "       nano /opt/tokensense/.env"
echo ""
echo "  2. Copy the Actian .whl into backend/:"
echo "       scp actiancortex-0.1.0b1-py3-none-any.whl root@<server-ip>:/opt/tokensense/backend/"
echo ""
echo "  3. Start all services:"
echo "       cd /opt/tokensense && docker compose up -d"
echo ""
echo "  4. Verify:"
echo "       docker compose ps"
echo "       curl http://localhost:8000/"
echo "============================================"
