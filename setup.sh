#!/bin/bash

# Quick Start Script for Portfolio Setup
# Run this script to set up your portfolio environment

echo "🚀 Portfolio Setup Script"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}✓ Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}  ✗ Node.js is not installed!${NC}"
    echo -e "${RED}  Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}  Node.js version: $(node --version)${NC}"

# Check if Docker is installed
echo -e "${YELLOW}✓ Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}  ✗ Docker is not installed!${NC}"
    echo -e "${RED}  Please install Docker from https://www.docker.com/products/docker-desktop${NC}"
    exit 1
fi
echo -e "${GREEN}  Docker version: $(docker --version)${NC}"

# Step 1: Install dependencies
echo ""
echo -e "${CYAN}📦 Step 1: Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"

# Step 2: Setup environment file
echo ""
echo -e "${CYAN}⚙️  Step 2: Setting up environment file...${NC}"
if [ -f ".env" ]; then
    echo -e "${YELLOW}  ℹ️  .env file already exists. Skipping...${NC}"
else
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created!${NC}"
    echo -e "${YELLOW}  ⚠️  IMPORTANT: Please edit .env and update:${NC}"
    echo -e "${YELLOW}     - BETTER_AUTH_SECRET (min 32 characters)${NC}"
    echo -e "${YELLOW}     - ADMIN_EMAIL${NC}"
    echo -e "${YELLOW}     - ADMIN_PASSWORD${NC}"
fi

# Step 3: Start PostgreSQL
echo ""
echo -e "${CYAN}🐘 Step 3: Starting PostgreSQL database...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start PostgreSQL!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL started successfully!${NC}"

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}  Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Step 4: Setup database schema
echo ""
echo -e "${CYAN}🗄️  Step 4: Setting up database schema...${NC}"
npm run db:push

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to setup database schema!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database schema created successfully!${NC}"

# Step 5: Seed database
echo ""
echo -e "${CYAN}🌱 Step 5: Seeding database with initial data...${NC}"
npm run db:seed

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to seed database!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database seeded successfully!${NC}"

# Done!
echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${NC}1. Review and update your .env file${NC}"
echo -e "${NC}2. Run 'npm run dev' to start the development server${NC}"
echo -e "${NC}3. Open http://localhost:3000 in your browser${NC}"
echo -e "${NC}4. Access admin panel at http://localhost:3000/admin/login${NC}"
echo ""
echo -e "${CYAN}Happy coding! 🚀${NC}"
