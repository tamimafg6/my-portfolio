# Quick Start Script for Portfolio Setup
# Run this script to set up your portfolio environment

Write-Host "🚀 Portfolio Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "✓ Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
Write-Host "✓ Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  Docker version: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker is not installed!" -ForegroundColor Red
    Write-Host "  Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host ""
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green

# Step 2: Setup environment file
Write-Host ""
Write-Host "⚙️  Step 2: Setting up environment file..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "  ℹ️  .env file already exists. Skipping..." -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created!" -ForegroundColor Green
    Write-Host "  ⚠️  IMPORTANT: Please edit .env and update:" -ForegroundColor Yellow
    Write-Host "     - BETTER_AUTH_SECRET (min 32 characters)" -ForegroundColor Yellow
    Write-Host "     - ADMIN_EMAIL" -ForegroundColor Yellow
    Write-Host "     - ADMIN_PASSWORD" -ForegroundColor Yellow
}

# Step 3: Start PostgreSQL
Write-Host ""
Write-Host "🐘 Step 3: Starting PostgreSQL database..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start PostgreSQL!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ PostgreSQL started successfully!" -ForegroundColor Green

# Wait for PostgreSQL to be ready
Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 4: Setup database schema
Write-Host ""
Write-Host "🗄️  Step 4: Setting up database schema..." -ForegroundColor Cyan
npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to setup database schema!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database schema created successfully!" -ForegroundColor Green

# Step 5: Seed database
Write-Host ""
Write-Host "🌱 Step 5: Seeding database with initial data..." -ForegroundColor Cyan
npm run db:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to seed database!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database seeded successfully!" -ForegroundColor Green

# Done!
Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review and update your .env file" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "4. Access admin panel at http://localhost:3000/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
