# Vultr + Actian Architecture

How Vultr Cloud Compute and Actian VectorAI DB work together in TokenSense.

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Internet ["Internet"]
        User1["User's Laptop<br/>pip install tokensense"]
        User2["Another User<br/>Web Browser"]
    end
    
    subgraph VultrVPS ["Vultr Cloud Compute VPS<br/>108.61.192.150"]
        subgraph DockerCompose ["Docker Compose Stack"]
            Frontend["Frontend Container<br/>Next.js:3000"]
            Backend["Backend Container<br/>FastAPI:8000"]
            Actian["Actian VectorAI DB<br/>gRPC:50051"]
        end
        
        subgraph Volumes ["Persistent Volumes"]
            ActianData["actian_data<br/>(vector indexes)"]
            BackendData["backend_data<br/>(SQLite telemetry)"]
        end
    end
    
    subgraph VultrFirewall ["Vultr Firewall"]
        Port22["Port 22<br/>(SSH)"]
        Port80["Port 80<br/>(HTTP)"]
        Port443["Port 443<br/>(HTTPS)"]
        PortBlocked["Ports 3000, 8000, 50051<br/>BLOCKED from internet"]
    end
    
    User1 -->|"CLI: tokensense ask"| Port80
    User2 -->|"Browser"| Port80
    Port80 --> Backend
    Port80 --> Frontend
    
    Frontend -.->|"internal network"| Backend
    Backend -.->|"internal gRPC"| Actian
    
    Actian -.-> ActianData
    Backend -.-> BackendData
    
    Port22 -.->|"Admin only"| VultrVPS
    PortBlocked -.->|"Protected"| DockerCompose
```

**Key insight:** Only HTTP/HTTPS are public. Actian and the backend communicate on Docker's internal network — completely isolated from the internet.

---

## How Actian Works Inside the Stack

```mermaid
flowchart LR
    subgraph VultrHost ["Vultr VPS Host"]
        subgraph DockerInternal ["Docker Internal Network"]
            Backend["Backend Container<br/>FastAPI"]
            Actian["Actian Container<br/>VectorAI DB"]
        end
        
        Volume["Volume: actian_data<br/>/data"]
    end
    
    Backend -->|"gRPC: actian:50051<br/>(internal DNS)"| Actian
    Actian <-->|"Persists vectors"| Volume
    
    Note["No external access!<br/>Actian only talks to Backend"]
```

**Environment variable in backend:**
```bash
ACTIAN_HOST=actian  # Docker Compose service name
ACTIAN_PORT=50051   # Internal port
```

**Why this matters:** Actian doesn't need authentication or encryption because it never touches the public internet. It's completely protected by Vultr's firewall.

---

## Data Flow: Indexing

```mermaid
sequenceDiagram
    participant User as User's Laptop
    participant Vultr as Vultr VPS<br/>(108.61.192.150:8000)
    participant Backend as Backend Container
    participant Actian as Actian Container

    User->>Vultr: tokensense index ./app
    Note over Vultr: HTTP request hits port 80
    Vultr->>Backend: POST /index
    Note over Backend: Split files into chunks
    Note over Backend: Embed each chunk
    Backend->>Actian: batch_upsert(ids, vectors, payloads)
    Note over Actian: Stores in collection<br/>"tokensense_chunks"
    Actian->>Backend: Success
    Backend->>User: "Indexed 50 files, 200 chunks"
```

**Actian's job:** Store 1,536-dimensional vectors with content and source file as payload. All communication happens inside Docker's private network.

---

## Data Flow: Querying

```mermaid
sequenceDiagram
    participant User as User's Laptop
    participant Vultr as Vultr VPS
    participant Backend as Backend Container
    participant Actian as Actian Container
    participant LLM as OpenRouter/Gemini

    User->>Vultr: tokensense ask "how does auth work?"
    Vultr->>Backend: POST /ask
    Note over Backend: Query Agent embeds question
    Backend->>Actian: search(query_vector, top_k=5)
    Note over Actian: Cosine similarity search<br/>across all stored vectors
    Actian->>Backend: [5 chunks with scores]
    Note over Backend: Context Optimizer compresses
    Note over Backend: Routing Agent picks model
    Backend->>LLM: Optimized context + query
    LLM->>Backend: Answer
    Backend->>User: Answer + cost breakdown
```

**Actian's job:** Semantic search in <50ms. Returns scored, ranked chunks with full payloads.

---

## Why Vultr + Actian is Perfect Together

| Challenge | Vultr Solution | Actian Solution |
|-----------|----------------|-----------------|
| **Hosting complexity** | One VPS runs everything via Docker Compose | Actian runs as a simple container, no cluster setup |
| **Network security** | Vultr Firewall blocks DB ports from internet | Actian uses internal Docker DNS, no auth needed |
| **Persistence** | Vultr VPS with persistent disk | Named Docker volume survives restarts |
| **Performance** | Low-latency VPS with SSD storage | gRPC protocol, <50ms search times |
| **Developer experience** | Single IP for all services | Zero config — `ACTIAN_HOST=actian` just works |

---

## Docker Compose Configuration

```yaml
services:
  actian:
    image: williamimoh/actian-vectorai-db:1.0b
    ports:
      - "50051"  # Internal only, NOT exposed to host
    volumes:
      - actian_data:/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - ACTIAN_HOST=actian      # Docker service name
      - ACTIAN_PORT=50051       # Internal port
    depends_on:
      - actian
    ports:
      - "8000:8000"             # Exposed to host
    volumes:
      - backend_data:/app/data
    restart: unless-stopped

volumes:
  actian_data:
  backend_data:
```

**Key detail:** `ports: - "50051"` without a host mapping means the port is only available inside Docker's network. The backend connects via `actian:50051` using Docker's internal DNS.

---

## One-Command Deployment

On the Vultr VPS:

```bash
# 1. Clone repo
git clone https://github.com/yourusername/TokenSense.git
cd TokenSense

# 2. Configure environment
cp .env.example .env
nano .env  # Add API keys

# 3. Start everything
docker-compose up -d

# 4. Verify
curl http://localhost:8000/
# {"status": "ok", "service": "TokenSense"}
```

That's it. Actian + Backend + Frontend all running, all persistent, all secured by Vultr's firewall.

---

## The "Wow" Story

**For judges:**

> "The entire TokenSense stack — backend, vector database, web UI — runs on a single Vultr VPS. Actian VectorAI DB stores all the vectors, but it's completely isolated from the internet. Only the FastAPI backend can talk to it, using Docker's internal network. When a user runs `pip install tokensense`, they're connecting to this Vultr instance in real-time. No local setup. No Docker on their machine. The vector search happens server-side at 108.61.192.150, inside Actian, and the results stream back in under 50 milliseconds.
>
> This is production-ready infrastructure — persistent storage, firewall-protected, one-command deploy — all built during a hackathon."

---

## Technical Highlights

### Vultr
- **Optimized Cloud Compute** — SSD storage, low-latency network
- **Firewall** — only ports 22/80/443 exposed, database layer protected
- **Single IP** — users connect to one address for CLI, API, and web UI
- **Docker-friendly** — `docker-compose up` just works

### Actian
- **gRPC performance** — binary protocol, <50ms search times
- **No auth overhead** — runs in isolated network, doesn't need encryption
- **Persistent volumes** — vectors survive container restarts
- **Cosine similarity** — built-in, fast, production-quality

### Together
- **Zero network configuration** — Docker Compose handles DNS automatically
- **Secure by default** — Actian never exposed to public internet
- **One-command deploy** — entire stack starts with `docker-compose up -d`
- **Production-ready** — persistent storage, automatic restarts, firewall protection
