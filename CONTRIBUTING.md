# Contributing to SkillBridge

Thank you for your interest in contributing to SkillBridge! We're excited to have you join our mission to create a transparent, meritocratic platform for developers to learn, teach, and showcase their skills.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Testing](#testing)
- [Questions?](#questions)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Go 1.25 or higher
- npm or yarn
- PostgreSQL
- Git

### Setting Up Your Development Environment

1. **Fork the repository**
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

```bash
git clone https://github.com/YOUR_USERNAME/skillbridge.git
cd skillbridge
```

3. **Install dependencies**

```bash
npm install
```

4. **Set up environment variables**

```bash
# Configure the Go API
cp .env.example backend-go/.env
# Edit backend-go/.env with local database credentials and secrets.
```

5. **Configure GitHub OAuth** (follow instructions in [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md))

6. **Start the development servers**

```bash
# Terminal 1: Start the Go API server
cd backend-go && go run ./cmd/api

# Terminal 2: Start the web server
cd apps/web && npm run dev
```

## 🏗️ Project Structure

```
skillbridge/
├── apps/
│   └── web/           # Frontend application (React/Vite)
├── backend-go/        # Backend API and tools (Go)
│   ├── cmd/api/       # API entry point
│   ├── cmd/seed-jobs/ # Sample data seeding command
│   └── migrations/    # PostgreSQL schema migrations
├── packages/          # Shared packages/libraries
├── infra/             # Infrastructure as code
├── test-github-integration.js  # GitHub integration test script
├── GITHUB_INTEGRATION.md      # GitHub integration documentation
├── GITHUB_OAUTH_SETUP.md      # GitHub OAuth setup guide
├── turbo.json         # Turborepo configuration
└── package.json       # Monorepo root configuration
```

### Apps Directory

- **web/**: Contains the frontend application built with React, Vite, and Tailwind CSS

The Go API and sample-data command live in **backend-go/**.

## Development Workflow

1. **Create a branch** from the `main` branch:

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following the style guides below.

3. **Test your changes** thoroughly.

4. **Commit your changes** with a descriptive commit message:

```bash
git add .
git commit -m "feat: add GitHub profile integration to user dashboard"
```

5. **Push your changes** to your fork:

```bash
git push origin feature/your-feature-name
```

6. **Open a Pull Request** to the main repository.

## Pull Request Process

1. **Ensure your PR description clearly describes the problem and solution.** Include any relevant issue numbers.

2. **Follow the style guides** outlined below.

3. **Include tests** for any new functionality or bug fixes.

4. **Update documentation** as needed.

5. **Wait for review** from maintainers. Address any feedback promptly.

6. **Once approved**, your PR will be merged by a maintainer.

## Style Guides

### JavaScript/React Style Guide

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks in React
- Use TypeScript for type safety where possible
- Write meaningful variable and function names
- Keep components focused and reusable

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters or less
- Reference issues and pull requests liberally after a blank line

Example:

```
feat: add GitHub profile integration to user dashboard

This adds the ability for users to connect their GitHub accounts
to their SkillBridge profiles, displaying their repositories,
contributions, and other stats.

Fixes #123
```

### Documentation Style Guide

- Use Markdown for documentation
- Keep sentences clear and concise
- Use examples to illustrate concepts
- Update documentation when making changes that affect users

## Testing

### Running Tests

```bash
# Test the Go API
cd backend-go && go test ./...

# Build the React/Vite frontend
cd apps/web && npm run build
```

### Writing Tests

- Write unit tests for utility functions and services
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for high test coverage, especially for critical functionality

## Areas Needing Contributions

We welcome contributions in all areas, but here are some specific areas where help is especially appreciated:

- **GitHub Integration**: Enhancing the GitHub profile integration features
- **UI/UX Improvements**: Making the interface more intuitive and visually appealing
- **Performance Optimization**: Improving load times and responsiveness
- **Documentation**: Writing guides, tutorials, and improving existing docs
- **Testing**: Adding more comprehensive test coverage
- **Accessibility**: Ensuring the platform is usable by everyone
- **Security**: Identifying and fixing potential vulnerabilities

## 🙋 Questions?

If you have questions about contributing to SkillBridge:

- Check the existing [Issues](https://github.com/your-username/skillbridge/issues)
- Open a new issue if your question isn't answered
- Join our community discussions (if available)

Thank you for contributing to SkillBridge! Your efforts help create a better platform for developers worldwide.
