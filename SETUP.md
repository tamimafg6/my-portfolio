# Portfolio Setup Guide

## Quick Start (5 minutes)

Follow these steps to get your portfolio running locally:

### Step 1: Install Dependencies

```bash
npm install
```

⏱️ This will take 2-3 minutes depending on your internet speed.

### Step 2: Setup Environment

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` file and update:

- `BETTER_AUTH_SECRET` - Generate using: `openssl rand -base64 32` or any random 32+ character string
- `ADMIN_EMAIL` - Your admin email (e.g., admin@yourdomain.com)
- `ADMIN_PASSWORD` - Your admin password (change this!)

### Step 3: Start PostgreSQL Database

```bash
docker-compose up -d
```

✅ This starts PostgreSQL in the background. Check it's running: `docker ps`

### Step 4: Setup Database Tables

```bash
npm run db:push
```

✅ This creates all necessary database tables.

### Step 5: Seed Initial Data

```bash
npm run db:seed
```

✅ This creates your admin user and default contact info.

### Step 6: Start Development Server

```bash
npm run dev
```

✅ Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## What's Next?

### Access Admin Panel

1. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Login with your admin credentials from `.env`
3. Start adding your:
   - Skills
   - Projects
   - Work Experience
   - Education
   - Resume/CV
   - Hobbies

### View Database (Optional)

```bash
npm run db:studio
```

This opens Drizzle Studio at [http://localhost:4983](http://localhost:4983) where you can view and edit database records directly.

---

## Common Issues & Solutions

### Issue: Docker not starting

**Solution**: Make sure Docker Desktop is running. Install from [docker.com](https://www.docker.com/products/docker-desktop)

### Issue: Port 5432 already in use

**Solution**: Another PostgreSQL is running. Either stop it or change the port in `docker-compose.yml`

### Issue: Database connection error

**Solution**:

1. Check PostgreSQL is running: `docker ps`
2. Verify DATABASE_URL in `.env` matches docker-compose settings
3. Restart containers: `docker-compose restart`

### Issue: Module not found errors

**Solution**: Delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```

---

## Development Workflow

1. **Making changes**: Edit files in `src/` directory
2. **Database changes**:
   - Modify schema in `src/db/schema/`
   - Run `npm run db:generate` to create migration
   - Run `npm run db:push` to apply changes
3. **Testing**: View changes at http://localhost:3000
4. **Committing**: Use Git to track your changes

---

## Production Deployment

### Before Deploying:

- [ ] Change all default passwords in `.env`
- [ ] Set `BETTER_AUTH_SECRET` to a strong random value
- [ ] Update `BETTER_AUTH_URL` to your production domain
- [ ] Enable email verification in `src/lib/auth.ts`
- [ ] Set up a production PostgreSQL database
- [ ] Configure environment variables on your hosting platform

### Deploy to DigitalOcean:

1. Push code to GitHub
2. Create new App in DigitalOcean App Platform
3. Connect your GitHub repository
4. Configure environment variables
5. Deploy!

Full deployment guide: See README.md

---

## Folder Structure Quick Reference

```
src/
├── app/               # Pages and routes
│   ├── api/          # API endpoints
│   ├── admin/        # Admin panel
│   └── [locale]/     # Public pages (i18n)
├── components/       # Reusable UI components
├── db/              # Database
│   └── schema/      # Database tables
├── lib/             # Utilities
└── i18n/            # Translations

messages/            # Translation files
├── en.json          # English
└── ar.json          # Arabic
```

---

## Need Help?

- **Drizzle ORM**: https://orm.drizzle.team/docs
- **Next.js**: https://nextjs.org/docs
- **BetterAuth**: https://www.better-auth.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

Good luck with your portfolio! 🚀
