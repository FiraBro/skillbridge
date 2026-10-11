# SkillBridge

SkillBridge is an innovative platform that combines the best of Upwork and Dev.to, creating a unique ecosystem where developers can learn, teach, and showcase their skills publicly while connecting with clients who can hire them based on real GitHub contributions and reputation.

## Problem Statement

Traditional freelance platforms often lack transparency about a developer's actual skills. Clients struggle to evaluate talent based on portfolios alone, while developers find it difficult to showcase their real coding abilities. SkillBridge solves this by integrating GitHub profiles directly, allowing clients to see authentic contributions and project work.

## Key Feature

### GitHub Profile Integration

- **Real Code Visibility**: Clients can see actual GitHub repositories, contributions, and coding patterns
- **Authentic Reputation**: Developers' GitHub stats, stars, and activity serve as proof of expertise
- **Live Sync**: GitHub profiles stay updated with the latest contributions and projects

### Learning & Teaching Platform

- **Knowledge Sharing**: Developers can write articles, tutorials, and share expertise (like Dev.to)
- **Public Portfolio**: Showcase skills through written content and live code examples
- **Community Engagement**: Comment, like, and discuss technical topics

### Job Marketplace

- **Problem Posts**: Clients post real problems they need solved
- **Direct Application**: Developers apply with solutions based on their GitHub portfolio
- **Transparent Hiring**: Clients can evaluate candidates based on actual code quality

### Developer Profiles

- **GitHub-powered**: Profiles enriched with GitHub data including repositories, contributions, and stats
- **Skill Verification**: Real projects and contributions speak louder than resumes
- **Reputation System**: Community-driven ratings and reviews

## Tech Stack

### Backend (`backend-go`)

- **Go** with **Gin**
- **PostgreSQL** for data persistence
- **GitHub OAuth** for authentication and profile integration
- In-process rate limiting for protected write and GitHub endpoints
- **JWT** for secure authentication

### Frontend (apps/web)

- **React** with **Vite** for fast development
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **TanStack Query** for data fetching
- **Recharts** for data visualization

### Infrastructure

- **Turborepo** for monorepo management
- **Docker** for containerization
- **Environment-based configurations**

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Go 1.25 or higher
- PostgreSQL
- GitHub OAuth App credentials

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/skillbridge.git
cd skillbridge
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
# Configure the Go API environment
cp .env.example backend-go/.env
# Edit backend-go/.env and set your local DATABASE_URL and secrets.
```

4. **Configure GitHub OAuth** (follow instructions in [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md))

5. **Start the development servers**

```bash
# Terminal 1: Start the Go API server
cd backend-go && go run ./cmd/api

# Terminal 2: Start the React/Vite frontend
cd apps/web && npm run dev
```

### Docker (Two Services)

The Compose setup runs only the Go API and the React/Vite frontend. PostgreSQL must be available separately. Copy `.env.example` to `.env`, set both JWT secrets, and set `DATABASE_URL` to a PostgreSQL instance reachable by Docker (for a database on the host, use `host.docker.internal` as the hostname). Then run:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

The frontend is available at `http://localhost:5173`, and the Go API at `http://localhost:4000`. Vite proxies API and upload requests directly to the Go service; Nginx and Turbo remain inactive.

6. **Seed sample data** (optional)

```bash
cd backend-go && go run ./cmd/seed-jobs
```

For production, update the `/api` rewrite in `apps/web/vercel.json` to point at the deployed Go API. The current rewrite still targets the previous Render API hostname.

## Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Vision

SkillBridge aims to revolutionize how developers showcase their skills and how clients find the right talent. By combining learning, teaching, and hiring in one platform with GitHub integration, we're building a more transparent and meritocratic freelance economy.

---

Built with ❤️ by the SkillBridge community
