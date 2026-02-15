# Workforce AI Website - Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd c:/Users/erens/.gemini/antigravity/playground/shining-star
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** workforce-ai (or your choice)
- **Directory?** ./ (current directory)

### Step 4: Set up Vercel KV Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis-compatible)
6. Name it: `workforce-ai-conversations`
7. Click **Create**

Vercel will automatically add the environment variables to your project!

### Step 5: Deploy to Production
```bash
vercel --prod
```

## 📊 Access Your Admin Dashboard

After deployment, visit:
```
https://your-project-name.vercel.app/admin.html
```

This dashboard shows:
- ✅ Total conversations
- ✅ Total messages
- ✅ Average duration
- ✅ Full conversation transcripts
- ✅ Visitor information

## 🔒 Secure Your Admin Dashboard (Important!)

Add password protection to `admin.html`:

1. Go to Vercel Dashboard → Your Project → Settings
2. Click **Environment Variables**
3. Add:
   - Key: `ADMIN_PASSWORD`
   - Value: `your-secure-password`
4. Redeploy

Then update `admin.html` to check password before showing data.

## 💾 What Gets Saved

Every conversation automatically saves:
- 📝 Full transcript (user + AI messages)
- 🎤 All AI audio chunks (WAV format, base64)
- ⏱️ Timestamps for every message
- 👤 Visitor info (browser, language, referrer)
- 🆔 Unique session ID

## 🌐 Your Website URLs

After deployment:
- **Main website**: `https://your-project-name.vercel.app`
- **Admin dashboard**: `https://your-project-name.vercel.app/admin.html`

## 📱 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `workforceai.com`)
3. Follow Vercel's DNS instructions
4. Done! Your site will be live on your domain

## 💰 Vercel Pricing

- **Hobby (Free)**: Perfect for starting
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions included
  
- **KV Database (Free tier)**:
  - 256MB storage
  - 3,000 commands/day
  - Enough for ~1,000 conversations

## 🔧 Local Development

To test locally before deploying:

```bash
npm install
vercel dev
```

Visit: `http://localhost:3000`

## 📞 Support

If you need help:
1. Check Vercel docs: https://vercel.com/docs
2. Vercel KV docs: https://vercel.com/docs/storage/vercel-kv

## ✅ Checklist

- [ ] Deployed to Vercel
- [ ] Created KV database
- [ ] Tested main website
- [ ] Tested admin dashboard
- [ ] Set up custom domain (optional)
- [ ] Added password protection to admin (recommended)
