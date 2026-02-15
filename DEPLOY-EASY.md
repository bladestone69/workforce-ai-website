# 🚀 Deploy to Vercel with Blob Storage (Updated)

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `workforce-ai-website`
3. Make it **Public**
4. **Don't** check any boxes
5. Click **"Create repository"**

## Step 2: Push Your Code

Run these commands in PowerShell:

```powershell
cd c:/Users/erens/.gemini/antigravity/playground/shining-star

git remote add origin https://github.com/bladestone69/workforce-ai-website.git
git branch -M main
git push -u origin main
```

If it asks for credentials, use your GitHub username and a **Personal Access Token** (not password):
- Create token at: https://github.com/settings/tokens
- Select: `repo` (full control)
- Copy and use as password

## Step 3: Deploy on Vercel

1. Go to: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel
4. Click **"Add New..."** → **"Project"**
5. Find `workforce-ai-website`
6. Click **"Import"**
7. Click **"Deploy"**

Wait ~1 minute for deployment to complete ✅

## Step 4: Create Blob Storage (Instead of KV)

1. In Vercel dashboard → Your project
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Blob"** (not KV)
5. Click **"Create"**

That's it! Vercel will automatically connect it to your project.

## ✅ Your Website is Live!

Visit:
- **Main site**: `https://workforce-ai-website.vercel.app` (or similar)
- **Admin dashboard**: `https://workforce-ai-website.vercel.app/admin.html`

## 🧪 Test It

1. Go to your website
2. Click "Talk to AI"
3. Have a conversation
4. Visit `/admin.html` to see it saved!

## 🔄 Future Updates

To update your website:

```powershell
cd c:/Users/erens/.gemini/antigravity/playground/shining-star

# Make changes, then:
git add .
git commit -m "Updated website"
git push
```

Vercel automatically redeploys! ✨

## 💰 Vercel Blob Pricing

**Free tier includes:**
- ✅ 500MB storage
- ✅ 5GB bandwidth/month
- ✅ Enough for ~500 conversations with audio

Perfect for starting! 🎉

## 🔒 Optional: Secure Admin Dashboard

Add password protection:

1. Vercel Dashboard → Your Project → Settings
2. Environment Variables
3. Add:
   - Name: `ADMIN_PASSWORD`
   - Value: `your-secure-password`
4. Save and redeploy

## 📱 Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions
4. Done!

## ❓ Troubleshooting

**If conversations don't save:**
1. Make sure Blob storage is created
2. Check Vercel deployment logs
3. Redeploy the project

**If admin dashboard is empty:**
1. Have at least one conversation first
2. Wait 30 seconds for auto-refresh
3. Click the "Refresh" button
