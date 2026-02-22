# TokenSense — Vultr Deployment Guide

Step-by-step instructions for deploying TokenSense to Vultr Cloud Compute.

---

## Why Vultr

Vultr is a hackathon track sponsor. By deploying TokenSense on Vultr, users can `pip install tokensense` and connect to a hosted API — no local Docker, no backend setup, no cloning required.

---

## Architecture

```
User's Machine              Vultr Cloud Compute (Ubuntu VPS)
─────────────              ────────────────────────────────
                          ┌──────────────────────────────┐
pip install tokensense    │                              │
     │                    │  ┌─────────────────────┐    │
     │                    │  │ FastAPI Backend     │    │
     ├────────────────────┼──│ :8000 (public)      │    │
     │                    │  └──────┬──────────────┘    │
                          │         │                    │
                          │  ┌──────▼──────────────┐    │
                          │  │ Actian VectorAI DB  │    │
                          │  │ :50051 (internal)   │    │
                          │  └─────────────────────┘    │
                          │                              │
                          └──────────────────────────────┘
```

---

## Prerequisites

- Vultr account ([vultr.com](https://www.vultr.com))
- GitHub repo pushed with all files (including `backend/Dockerfile`, `docker-compose.yml`)
- **Actian cortex wheel file** downloaded and placed in `backend/` directory
- Your `.env` API keys ready to paste

---

## Part 1 — Prepare Locally

### 1. Download Actian VectorAI DB client

Go to [https://github.com/hackmamba-io/actian-vectorAI-db-beta](https://github.com/hackmamba-io/actian-vectorAI-db-beta) and download `actiancortex-0.1.0b1-py3-none-any.whl`.

Place it in the `backend/` directory:

```bash
cd backend
# Download or copy the wheel here
ls -la actiancortex-0.1.0b1-py3-none-any.whl
```

### 2. Push to GitHub

```bash
git add backend/actiancortex-0.1.0b1-py3-none-any.whl
git commit -m "Add Actian wheel for Docker build"
git push
```

---

## Part 2 — Create Vultr Server

### 3. Log in to Vultr

Go to [my.vultr.com](https://my.vultr.com)

### 4. Create Firewall Group (optional but recommended)

- Sidebar → **Network** → **Firewall**
- Click **Add Firewall Group**
- Name: `tokensense`
- Add 3 rules:

| Protocol | Port | Source | Action |
|---|---|---|---|
| SSH | 22 | Anywhere | Accept |
| TCP | 80 | Anywhere | Accept |
| Custom | 8000 | Anywhere | Accept |

(Port 80 is for future use, port 8000 is your backend API)

### 5. Deploy Server

- Click **Deploy** (big blue button top right)
- Choose **Cloud Compute**
- **Type:** Regular or Optimized
- **Location:** Closest to you
- **Image:** Ubuntu 22.04 LTS x64
- **Plan:** $12/mo minimum (1 vCPU, 2GB RAM) — recommended for TokenSense
- **Add SSH Key:**
  - Run on your Mac: `cat ~/.ssh/id_rsa.pub` (or `cat ~/.ssh/id_ed25519.pub`)
  - Click **Add New** in Vultr, paste the key
- **Firewall:** Select `tokensense` (the group you just created)
- **Label:** `tokensense-prod`
- Click **Deploy Now**

Wait ~60 seconds for the server to spin up.

### 6. Note Your Server IP

Once the server is running, copy the **public IP address** from the dashboard. You'll use this as:
- API URL: `http://<VULTR_IP>:8000`

---

## Part 3 — Deploy on the Server

### 7. SSH into the server

```bash
ssh root@<VULTR_IP>
```

If prompted about authenticity, type `yes`.

### 8. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
```

Verify:
```bash
docker --version
# Docker version 25.x.x
```

### 9. Install Docker Compose

```bash
apt-get update && apt-get install -y docker-compose-plugin
```

Verify:
```bash
docker compose version
# Docker Compose version v2.x.x
```

### 10. Clone your repo

```bash
git clone https://github.com/yourusername/TokenSense.git /opt/tokensense
cd /opt/tokensense
```

Replace `yourusername` with your actual GitHub username.

### 11. Configure environment

```bash
cp .env.example .env
nano .env
```

Fill in your real keys:

```bash
TOKENSENSE_API_KEY=your-secret-api-key
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=AIza...
ACTIAN_HOST=actian
ACTIAN_PORT=50051
```

**Important:** `ACTIAN_HOST=actian` (the Docker service name), not `localhost`.

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 12. Start all services

```bash
docker compose up -d
```

This will:
- Pull the Actian VectorAI DB image
- Build the backend Docker image (takes 2-3 minutes first time)
- Start both services in the background

### 13. Verify services are running

```bash
docker compose ps
```

You should see:

```
NAME                      STATUS
tokensense-actian-1       Up
tokensense-backend-1      Up
```

Check the backend is responding:

```bash
curl http://localhost:8000/
```

Expected output:
```json
{"status":"ok","service":"TokenSense","version":"0.1.0"}
```

### 14. Check logs if something's wrong

```bash
docker compose logs backend    # backend logs
docker compose logs actian     # vector DB logs
docker compose logs -f         # follow all logs in real-time
```

Common issues:
- **"ImportError: No module named cortex"** — Actian wheel missing from `backend/`
- **"Connection refused"** — Actian not ready yet, wait 10 seconds and retry
- **"Invalid API key"** — `.env` file not loaded correctly

---

## Part 4 — Test from Your Local Machine

### 15. Test the hosted API

From your Mac (not the server):

```bash
curl http://<VULTR_IP>:8000/
```

Expected: `{"status":"ok","service":"TokenSense"}`

### 16. Test with the CLI

```bash
pip install tokensense
tokensense init
# API URL: http://<VULTR_IP>:8000
# API key: <your-secret-api-key>

tokensense index ./some-project
tokensense ask "how does authentication work?"
tokensense stats
```

If everything works, you'll see:
- Index completes successfully
- Ask returns an answer with token stats
- Stats shows your queries and cost savings

---

## Part 5 — Using the `--demo` Flag

For hackathon judges or new users, you can create a shortcut by updating the CLI with your Vultr IP.

### Update the demo URL in the CLI

Edit `tokensense/cli.py` (line 32):

```python
_DEMO_URL = "http://<YOUR_VULTR_IP>:8000"
```

Replace `<YOUR_VULTR_IP>` with your actual server IP (e.g., `http://123.45.67.89:8000`).

Rebuild and publish the package:

```bash
python -m build
twine upload dist/tokensense-0.1.1-py3-none-any.whl dist/tokensense-0.1.1.tar.gz
```

Now users can run:

```bash
pip install tokensense --upgrade
tokensense init --demo
# API key: <key>
```

This auto-sets the URL to your Vultr-hosted backend — no manual configuration needed.

---

## Troubleshooting

### Backend not accessible from outside

Check Vultr firewall allows port 8000:
```bash
# On the server
apt-get install net-tools
netstat -tuln | grep 8000
```

If you see `0.0.0.0:8000`, the backend is listening. If you still can't reach it, check Vultr Firewall rules.

### Actian connection errors

Check if Actian is running:
```bash
docker compose logs actian | tail -20
```

Restart if needed:
```bash
docker compose restart actian
docker compose restart backend
```

### Out of memory

If the server crashes with OOM errors, upgrade to the $24/mo plan (4GB RAM).

### Rebuilding after code changes

```bash
git pull
docker compose build backend
docker compose up -d
```

---

## Maintenance Commands

| Task | Command |
|---|---|
| View logs | `docker compose logs -f` |
| Restart everything | `docker compose restart` |
| Stop everything | `docker compose down` |
| Update code | `git pull && docker compose up -d --build` |
| Check disk usage | `df -h` |
| Check memory | `free -h` |

---

## Cost Estimate

| Plan | RAM | CPU | Cost | $100 lasts |
|---|---|---|---|---|
| Regular $6/mo | 1 GB | 1 | $6/mo | ~16 months |
| Regular $12/mo | 2 GB | 1 | $12/mo | ~8 months |
| Optimized $12/mo | 2 GB | 1 HF | $12/mo | ~8 months |
| Optimized $24/mo | 4 GB | 2 HF | $24/mo | ~4 months |

**Recommended:** $12/mo (2GB RAM) — enough for TokenSense with headroom for growth.

---

## What Users See After Deployment

```bash
pip install tokensense
tokensense init
# API URL: http://<VULTR_IP>:8000
# API key: <key>

tokensense index ./my-project
tokensense ask "how does auth work?"
tokensense stats
```

No Docker, no cloning, no backend setup — just `pip install` and go. The entire backend + vector DB runs on Vultr infrastructure.

---

## Next Steps (Optional Enhancements)

- Get a free domain (nip.io or duckdns.org) and enable HTTPS via Caddy
- Add the frontend (Phase 3) and expose port 3000
- Set up monitoring (UptimeRobot, Grafana, or Vultr's built-in monitoring)
- Create a demo API key for hackathon judges
- Add rate limiting to prevent abuse
