#!/bin/bash

# NFL Forecasting MVP - Database Setup Script
# This script initializes your production database

set -e  # Exit on any error

echo "🏈 NFL Forecasting MVP - Database Setup"
echo "========================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "export DATABASE_URL='your-supabase-postgres-url'"
    echo ""
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo "✓ Prisma Client generated"
echo ""

# Push database schema
echo "📊 Pushing database schema to production..."
npx prisma db push --accept-data-loss
echo "✓ Database schema pushed"
echo ""

# Seed database
echo "🌱 Seeding database with sample data..."
npx tsx prisma/seed.ts
echo "✓ Database seeded"
echo ""

echo "=========================================="
echo "✅ Database setup complete!"
echo ""
echo "Your production database is ready with:"
echo "  - NFL league and teams"
echo "  - 2 sample games (scheduled for tomorrow)"
echo "  - Sample odds, weather, and ELO ratings"
echo ""
echo "Next step: Visit your Vercel app and test it!"
echo "=========================================="
