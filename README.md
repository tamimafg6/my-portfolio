# Portfolio Monorepo

> Modern portfolio application with microservices architecture

**Last updated:** January 2026

[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-green)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## 🏗️ Architecture

```
portfolio-monorepo/
├── frontend/              # Next.js 15 Application (Port 3000)
│   ├── src/app/          # App Router with i18n (en, fr)
│   ├── components/       # React Components
│   ├── public/           # Static Assets
│   └── messages/         # Translations
│
├── backend/              # Express.js API (Port 4000)
│   ├── src/server.ts    # Main Server
│   ├── routes/          # API Endpoints
│   └── db/              # Database Config
│
└── docker-compose.yml   # PostgreSQL 17 + Services
```

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

**Access:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Health Check: http://localhost:8080/health
- Auth Service: http://localhost:3001

### Local Development

**1. Install dependencies:**

```bash
npm run install:all
```

**2. Start PostgreSQL:**

```bash
docker-compose up postgres -d
```

**3. Initialize database:**

```bash
cd frontend
npm run db:push
npm run db:seed
cd ..
```

**4. Start development servers:**

```bash
npm run dev
```

## 📋 Available Scripts

### Root Level

```bash
npm run dev              # Start both services in dev mode
npm run build            # Build both services
npm run start            # Start production servers
npm run install:all      # Install all dependencies
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:build     # Rebuild Docker images
npm run docker:logs      # View Docker logs
npm run docker:clean     # Remove volumes and data
```

### Frontend (`cd frontend`)

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Start production server
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with data
npm run db:studio        # Open Drizzle Studio
```

### Backend (`cd backend`)

```bash
npm run dev              # Development with hot reload
npm run build            # TypeScript compilation
npm run start            # Start production server
```

## 🔌 API Endpoints

**Base URL:** `http://localhost:8080/api`

### Skills

- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills` - Create skill _(admin)_
- `PUT /api/skills/:id` - Update skill _(admin)_
- `DELETE /api/skills/:id` - Delete skill _(admin)_

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project _(admin)_
- `PUT /api/projects/:id` - Update project _(admin)_
- `DELETE /api/projects/:id` - Delete project _(admin)_

### Experience

- `GET /api/experience` - Get all work experience
- `GET /api/experience/:id` - Get experience by ID

### Education

- `GET /api/education` - Get all education
- `GET /api/education/:id` - Get education by ID

### Contact

- `POST /api/contact` - Submit contact form
- `GET /api/contact/messages` - Get all messages _(admin)_

## 🗄️ Database

**PostgreSQL 17** with Drizzle ORM

**Connection String:**

```
postgresql://postgres:password@localhost:5432/portfolio
```

## 🌐 Features

### Frontend

✅ Next.js 15 with App Router  
✅ React 19  
✅ TypeScript  
✅ Tailwind CSS  
✅ Bilingual (EN/FR) with next-intl  
✅ Dark/Light mode with next-themes  
✅ BetterAuth authentication  
✅ Responsive design  
✅ SEO optimized

### Backend

✅ Express.js with TypeScript  
✅ REST API  
✅ CORS enabled  
✅ Helmet security  
✅ Health checks  
✅ Error handling  
✅ Drizzle ORM integration

### Infrastructure

✅ Docker containerization  
✅ Docker Compose orchestration  
✅ PostgreSQL 17  
✅ Health checks  
✅ Network isolation

## 🔧 Tech Stack

**Frontend:**

- Next.js 15.5.9
- React 19
- TypeScript 5.7.2
- Tailwind CSS 3.4.1
- next-intl 3.26.0
- next-themes 0.4.6
- Drizzle ORM 0.45.0
- BetterAuth 1.4.0

**Backend:**

- Express.js 4.18.2
- TypeScript 5.7.2
- Drizzle ORM 0.45.0
- PostgreSQL (postgres 3.4.4)
- CORS 2.8.5
- Helmet 7.1.0

**Database:**

- PostgreSQL 17 Alpine

**DevOps:**

- Docker
- Docker Compose
- Node.js 18 Alpine



## 📚 Documentation

- [Development Guide](./DEVELOPMENT.md) - Local setup without Docker
- [Project Structure](./PROJECT_STRUCTURE.md) - Detailed architecture
- [Docker Setup](./DOCKER_README.md) - Docker configuration
- [Frontend Docs](./frontend/README.md)
- [Backend Docs](./backend/README.md)

## 🚢 Deployment

### Docker Production

```bash
npm run docker:build
```

### Manual Deployment

**Backend:**

```bash
cd backend
npm run build
NODE_ENV=production npm start
```

**Frontend:**

```bash
cd frontend
npm run build
NODE_ENV=production npm start
```

## 🔄 Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes to frontend or backend
3. Test locally: `npm run dev`
4. Build and test: `npm run build`
5. Test with Docker: `npm run docker:build`
6. Commit and push changes

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env files
- Verify database exists

### 401 / Token not provided in production (admin forms, testimonials, uploads)

The auth service derives the cookie domain from `FRONTEND_URL` or `BETTER_AUTH_URL` so the session cookie is shared across subdomains. Ensure those are set in production; no extra env is needed.

### Module Not Found

```bash
npm run install:all
```

### Clean Install

```bash
npm run clean
npm run install:all
```

## 📄 License

Private - © 2026 Tamim Afghanyar

## 👤 Author

**Tamim Afghanyar**

- GitHub: [@tamimafg6](https://github.com/tamimafg6)
- LinkedIn: [Tamim Afghanyar](https://www.linkedin.com/in/tamim-afghanyar-2026852b3)
- Email: tamim.afghanyar@gmail.com

---

Built with ❤️ using Next.js, Express.js, and PostgreSQL
