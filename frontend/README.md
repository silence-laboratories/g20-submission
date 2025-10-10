# Frontend Setup Guide

Next.js 15 application with React 19, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp env-template.txt .env
# Edit .env if needed (defaults should work for local development)

# 3. Start development server
npm run dev
```

Visit http://localhost:3000

## Prerequisites

- **Node.js 18+** (tested with Node 18 and 20)
- **npm** or **pnpm** package manager
- **Backend API** running on http://localhost:8000

## Installation

### Using npm (recommended)

```bash
npm install
```

### Using pnpm

```bash
pnpm install
```

### Using yarn

```bash
yarn install
```

## Environment Configuration

### Create Environment File

```bash
cp env-template.txt .env
```

### Required Environment Variables

```env
# Backend API URL - Must match your backend server
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
```
## Development

### Start Development Server

```bash
npm run dev
```

The application will start on http://localhost:3000 with:
- Hot reload enabled (Turbopack)
- Fast refresh for React components
- Automatic TypeScript compilation
- Error overlay for development

### Development on Custom Port

```bash
PORT=3001 npm run dev
```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Run Production Build Locally

```bash
npm run build
npm run start
```

### Code Quality

#### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Strict linting (fail on warnings)
npm run lint:strict
```

#### Formatting

```bash
# Format all files with Prettier
npm run format

# Check formatting without making changes
npm run format:check
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── register/          # Registration page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # Reusable components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── ...
│   │
│   ├── features/             # Feature-specific components
│   │   ├── auth/            # Authentication feature
│   │   ├── applications/    # Loan applications
│   │   ├── apply-loan/      # Loan application form
│   │   ├── kanban/          # Kanban board
│   │   ├── maps/            # Map visualizations
│   │   ├── overview/        # Dashboard overview
│   │   └── profile/         # User profile
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── use-debounce.tsx
│   │   └── ...
│   │
│   ├── lib/                 # Utility functions
│   │   ├── api.ts          # API client
│   │   ├── utils.ts        # General utilities
│   │   └── ...
│   │
│   ├── store/              # State management (Zustand)
│   │   ├── loan-store.ts
│   │   └── sme-store.ts
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   │
│   └── middleware.ts       # Next.js middleware
│
├── public/                 # Static assets
│   ├── assets/            # Images, videos, etc.
│   └── ...
│
├── .env                   # Environment variables (not in git)
├── env.example.txt        # Environment template
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```


## Docker Setup

For containerized deployment, see [DOCKER.md](DOCKER.md).

### Quick Docker Commands

```bash
# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```
