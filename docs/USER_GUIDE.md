# TokenSense — User Guide

How to install, configure, and use TokenSense.

---

## Prerequisites

- Python 3.11+
- Docker (for Actian VectorAI DB)
- API keys for [OpenRouter](https://openrouter.ai/keys) and [Google AI Studio (Gemini)](https://makersuite.google.com/app/apikey)

---

## Installation

### Install the CLI

```bash
pip install tokensense
```

The `tokensense` command is now available globally.

### Clone the backend

```bash
git clone https://github.com/yourusername/TokenSense.git
cd TokenSense
```

### Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```bash
TOKENSENSE_API_KEY=pick-any-secret-string
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=AIza...
ACTIAN_HOST=localhost
ACTIAN_PORT=50051
```

### Start Actian VectorAI DB

```bash
docker run -d -p 50051:50051 actian/vectorai-db
```

### Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Configuration

Run the init command to save your API URL and key locally:

```bash
tokensense init
```

```
API URL [http://localhost:8000]: ↵
API key: ********
✓ Config saved to ~/.tokensense/config
```

This only needs to be done once. The config is stored at `~/.tokensense/config`.

---

## Usage

### Index your codebase

Point TokenSense at any project directory. It will embed your source files into the vector database for semantic search.

```bash
tokensense index ./my-project
```

```
╭──────── Index Complete ────────╮
│   Files indexed:  142          │
│   Total chunks:   87           │
│   Status:         ok           │
╰────────────────────────────────╯
```

You can filter by file extension:

```bash
tokensense index ./my-project --ext ".py,.ts,.md"
```

### Ask questions

Send a natural language question through the full optimization pipeline:

```bash
tokensense ask "how does the authentication flow work?"
```

TokenSense will:
1. Embed your question
2. Retrieve relevant code chunks from the vector DB
3. Compress and deduplicate the context
4. Route to the best model for the task
5. Return the answer with full token stats

```
╭─────────────────── Answer ───────────────────╮
│ The authentication flow uses verify_api_key   │
│ middleware that checks the X-API-Key header   │
│ against the TOKENSENSE_API_KEY env variable.  │
│ If the key is missing or invalid, it raises   │
│ a 401/422 HTTP error...                       │
╰───────────────────────────────────────────────╯

┌──────────────────┬──────────────┐
│ Metric           │ Value        │
├──────────────────┼──────────────┤
│ Model            │ claude-haiku │
│ Input tokens     │ 2,100        │
│ Output tokens    │ 107          │
│ Optimized tokens │ 131          │
│ Context reduction│ 74%          │
│ Cost             │ $0.001200    │
│ Latency          │ 1,032 ms     │
└──────────────────┴──────────────┘
```

Set a custom token budget:

```bash
tokensense ask "explain the database schema" --budget 4000
```

### View usage stats

See aggregate analytics on your queries, token savings, costs, and latency:

```bash
tokensense stats
```

```
╭───────── Summary ──────────╮
│   Total queries:   1,284   │
│   Avg reduction:   68%     │
│   Total cost:      $0.0017 │
│   Avg latency:     1,631ms │
╰────────────────────────────╯
```

Limit the number of recent queries shown:

```bash
tokensense stats --limit 10
```

---

## API Usage

If you prefer to call the backend directly (for integration into your own apps):

### Index

```bash
curl -X POST http://localhost:8000/index \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"path": "./my-project", "file_extensions": [".py", ".ts"]}'
```

### Ask

```bash
curl -X POST http://localhost:8000/ask \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "explain the auth flow", "token_budget": 8000}'
```

### Optimize (context only, no LLM call)

```bash
curl -X POST http://localhost:8000/optimize \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "describe the routing agent", "token_budget": 8000}'
```

### Stats

```bash
curl http://localhost:8000/stats?limit=20 \
  -H "X-API-Key: your-key"
```

---

## Quick Reference

| Command | Description |
|---|---|
| `tokensense init` | Configure API URL and key (one-time) |
| `tokensense index <path>` | Index a directory into the vector DB |
| `tokensense index <path> --ext ".py,.md"` | Index with specific file extensions |
| `tokensense ask "<query>"` | Ask a question through the full pipeline |
| `tokensense ask "<query>" --budget 4000` | Ask with a custom token budget |
| `tokensense stats` | View usage summary and recent queries |
| `tokensense stats --limit 10` | Limit number of recent queries shown |

---

## Troubleshooting

### "Config not found" error

Run `tokensense init` to create your config file.

### "Could not connect" error

Make sure the backend is running:

```bash
cd backend && uvicorn main:app --reload --port 8000
```

### "401 Unauthorized" error

Your API key doesn't match. Check that the key you used in `tokensense init` matches the `TOKENSENSE_API_KEY` in your `.env` file.

### Actian connection errors

Make sure the Docker container is running:

```bash
docker ps | grep vectorai
```

If not running, start it:

```bash
docker run -d -p 50051:50051 actian/vectorai-db
```
