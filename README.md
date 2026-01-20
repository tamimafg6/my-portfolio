# My Portfolio Website

A fully dynamic, bilingual portfolio website built with Next.js, PostgreSQL, and modern web technologies.

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: BetterAuth
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl (English & Arabic)
- **Deployment**: DigitalOcean (Docker ready)
- **Version Control**: Git & GitHub

## 📋 Features

### Public Features

- ✅ Bilingual support (English/Arabic)
- ✅ Fully responsive design
- ✅ Dynamic content from database
- ✅ Skills showcase
- ✅ Projects portfolio
- ✅ Work experience timeline
- ✅ Education history
- ✅ Downloadable resume/CV
- ✅ Hobbies section
- ✅ Contact form
- ✅ Testimonials display

### Admin Features

- ✅ Secure admin authentication
- ✅ Admin dashboard
- ✅ CRUD operations for:
  - Skills
  - Projects
  - Work experience
  - Education
  - Resume/CV
  - Contact information
  - Hobbies
- ✅ View contact form submissions
- ✅ Testimonial management (approve/reject/delete)
- ✅ Real-time content updates

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed (for PostgreSQL)
- Git installed

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd my-portfolio
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

\`\`\`bash

# Copy the example env file

cp .env.example .env

# Edit .env and update the values:

# - DATABASE_URL

# - BETTER_AUTH_SECRET (generate a secure random string, min 32 chars)

# - ADMIN_EMAIL and ADMIN_PASSWORD (for initial admin access)

\`\`\`

### 4. Start PostgreSQL with Docker

\`\`\`bash
docker-compose up -d
\`\`\`

### 5. Generate and Run Database Migrations

\`\`\`bash

# Generate migration files

npm run db:generate

# Apply migrations to database

npm run db:push
\`\`\`

### 6. Create Admin User

You'll need to create an admin user manually or through a seed script:

\`\`\`bash

# Option 1: Use Drizzle Studio to insert data

npm run db:studio

# Option 2: Create a seed script (recommended)

# Create src/db/seed.ts and run it

\`\`\`

### 7. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your portfolio!

## 📁 Project Structure

\`\`\`
my-portfolio/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── api/ # API routes
│ │ ├── admin/ # Admin panel pages
│ │ ├── [locale]/ # Public pages (i18n)
│ │ └── globals.css # Global styles
│ ├── components/ # React components
│ ├── db/ # Database configuration
│ │ └── schema/ # Drizzle ORM schemas
│ ├── i18n/ # Internationalization
│ ├── lib/ # Utility functions
│ └── middleware.ts # Next.js middleware
├── messages/ # Translation files
│ ├── en.json # English translations
│ └── ar.json # Arabic translations
├── public/ # Static files
├── docker-compose.yml # Docker configuration
├── drizzle.config.ts # Drizzle ORM config
├── next.config.ts # Next.js config
├── tailwind.config.ts # Tailwind CSS config
└── package.json # Dependencies
\`\`\`

## 🗄️ Database Schema

The database includes the following tables:

- **users** - User authentication
- **sessions** - Auth sessions
- **skills** - User skills (bilingual)
- **projects** - Portfolio projects (bilingual)
- **work_experience** - Work history (bilingual)
- **education** - Educational background (bilingual)
- **resumes** - CV/Resume files (bilingual)
- **hobbies** - Personal hobbies (bilingual)
- **contact_messages** - Contact form submissions
- **testimonials** - User testimonials with approval status
- **contact_info** - Contact information and social links

## 🚢 Deployment

### Docker Deployment

\`\`\`bash

# Build the Docker image

docker build -t my-portfolio .

# Run the container

docker run -p 3000:3000 --env-file .env my-portfolio
\`\`\`

### DigitalOcean Deployment

1. Create a DigitalOcean App Platform project
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy!

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Apply migrations to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🔐 Security Notes

- ✅ Change default admin credentials in `.env`
- ✅ Use a strong `BETTER_AUTH_SECRET` (min 32 characters)
- ✅ Never commit `.env` file to version control
- ✅ Enable email verification in production
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for contact form

## 📖 Next Steps

1. Install dependencies: `npm install`
2. Start PostgreSQL: `docker-compose up -d`
3. Setup environment: `cp .env.example .env`
4. Run migrations: `npm run db:push`
5. Create admin user
6. Start development: `npm run dev`
7. Build your portfolio components
8. Deploy to DigitalOcean

## 📄 License

MIT License - feel free to use this project for your portfolio!

## 🤝 Contributing

This is a personal portfolio project, but suggestions and improvements are welcome!

---

**Student**: Tamim Afghanyar  
**ID**: 2330990  
**Course**: Portfolio Software Evaluation
