# NFL Forecasting MVP - Deployment Guide

## ⚡ Super Quick Deploy (3 Steps)

### Step 1: Deploy to Vercel (2 minutes)

**Do this in your browser:**

1. Go to: https://vercel.com/new
2. Click "Import" on `chrisglitz/ALLINSPORTS`
3. Click "Environment Variables" and add these 3:

```
DATABASE_URL = [paste POSTGRES_URL from Supabase]
USE_MOCK_DATA = true
CRON_SECRET = [paste: openssl rand -base64 32 output]
```

4. Click "Deploy"
5. Wait for build to complete (2-3 min)

---

### Step 2: Get Your Supabase URL

From your Supabase dashboard, copy the **POSTGRES_URL** (the one that starts with `postgresql://postgres.`)

---

### Step 3: Set Up Database (1 command)

**In your terminal:**

```bash
# Navigate to your project
cd /path/to/ALLINSPORTS

# Set your database URL
export DATABASE_URL="postgresql://postgres.[YOUR_URL_HERE]"

# Run the automated setup script
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

**That's it!** Your app is live.

---

## 🎯 What Just Happened

✅ Vercel deployed your Next.js app
✅ Database schema created in Supabase
✅ Sample NFL data added (teams, games, odds)
✅ Background jobs configured
✅ Your app is live at: `https://your-app.vercel.app`

---

## 🧪 Test Your App

Visit your Vercel URL:

1. **Homepage** → See disclaimer ✅
2. **Click "View NFL Games"** → See games list ✅
3. **Click a game** → See predictions ✅
4. **Try "Next Day" button** → Navigate dates ✅

---

## 🔄 If You Need to Redeploy

Just push to GitHub:

```bash
git add .
git commit -m "your changes"
git push
```

Vercel auto-deploys on every push!

---

## 🆘 Troubleshooting

**"No games showing"**
- Games are created for tomorrow
- Click "Next Day →" to see them

**"Database error"**
- Make sure you used POSTGRES_URL (not POSTGRES_PRISMA_URL)
- Check the URL includes your password

**"Build failed"**
- Check environment variables are correct
- Look at build logs in Vercel dashboard

---

**Questions?** The app is fully functional and ready to go! 🚀
