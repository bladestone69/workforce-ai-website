# 🌐 Connecting Your Cool Ideas Domain to Vercel

Since your site is hosted on Vercel but your domain is registered with Cool Ideas (cPanel), you need to point your domain to Vercel's servers. You do **not** need to move your hosting.

## ✅ Step 1: Add Domain to Vercel

1.  Log in to your **Vercel Dashboard**.
2.  Go to your project (Lockdown Studios).
3.  Click on **Settings** -> **Domains**.
4.  Enter your domain name (e.g., `lockdownstudios.co.za`) and click **Add**.
5.  Vercel will show you two records you need to add:
    *   **A Record** (for the root domain `@`): `76.76.21.21`
    *   **CNAME Record** (for `www`): `cname.vercel-dns.com`

---

## ⚙️ Step 2: Configure DNS in cPanel (Cool Ideas)

1.  Log in to your **cPanel** account.
2.  Look for the **Domains** or **DNS** section.
3.  Click on **Zone Editor** (or "DNS Zone Editor").
4.  Find your domain in the list and click **Manage**.

### Update the A Record (Root Domain)
1.  Look for the record where **Name** is your domain (e.g., `lockdownstudios.co.za.` with a dot at the end) and **Type** is **A**.
2.  Click **Edit**.
3.  Change the **Record** (or IP Address) value to: `76.76.21.21`
4.  Click **Save Record**.

### Update the CNAME Record (www)
1.  Look for the record where **Name** is `www.lockdownstudios.co.za.` (or just `www`) and **Type** is **CNAME**.
2.  Click **Edit**.
3.  Change the **Record** (or CNAME) value to: `cname.vercel-dns.com`
4.  Click **Save Record**.

> **Note:** If you don't have these records, click **+ Add Record** to create them.

---

## ⏳ Step 3: Wait for Propagation

DNS changes can take anywhere from **1 hour to 24 hours** to propagate across the internet.
*   You can check the status on your Vercel Domains page. It will turn green when successful.
*   Once green, visiting `yourdomain.co.za` will automatically show your Vercel-hosted site!

---

## 📧 What About Email?

If you have email set up (e.g., `info@lockdownstudios.co.za`), ensure you **do not touch the MX records**. As long as you only change the **A record** (@) and **CNAME** (www) as instructed above, your email will continue to work through Cool Ideas.
