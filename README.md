# SkillBridge

SkillBridge is an innovative platform that combines the best of Upwork and Dev.to, creating a unique ecosystem where developers can learn, teach, and showcase their skills publicly while connecting with clients who can hire them based on real GitHub contributions and reputation.

## 🎯 Problem Statement

Traditional freelance platforms often lack transparency about a developer's actual skills. Clients struggle to evaluate talent based on portfolios alone, while developers find it difficult to showcase their real coding abilities. SkillBridge solves this by integrating GitHub profiles directly, allowing clients to see authentic contributions and project work.

## ✨ Key Features

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

## 🏗️ Tech Stack

### Backend (apps/api)
- **Node.js** with **Express.js**
- **PostgreSQL** for data persistence
- **GitHub OAuth** for authentication and profile integration
- **Redis** for caching and rate limiting
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

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
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
# Copy the example environment files
cp .env.example apps/api/.env
cp .env.example apps/web/.env
```

4. **Configure GitHub OAuth** (follow instructions in [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md))

5. **Start the development servers**
```bash
# Terminal 1: Start the API server
cd apps/api && npm run dev

# Terminal 2: Start the web server
cd apps/web && npm run dev
```

6. **Seed sample data** (optional)
```bash
node seed_jobs.js
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Vision

SkillBridge aims to revolutionize how developers showcase their skills and how clients find the right talent. By combining learning, teaching, and hiring in one platform with GitHub integration, we're building a more transparent and meritocratic freelance economy.

---

Built with ❤️ by the SkillBridge community