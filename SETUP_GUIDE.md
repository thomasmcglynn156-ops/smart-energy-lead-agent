# Smart Energy Lead Agent - Setup & Deployment Guide

## Overview

This is a complete AI-powered lead generation system that replaces your Jotform with **reliable document capture**, **automated data extraction**, and **intelligent lead scoring**.

**What you're getting:**
- ✅ Replicated Jotform conditional logic (all 9 questions + branches)
- ✅ Guaranteed file upload capture (no more missing documents)
- ✅ AI bill reading (auto-extracts meter data, rates, standing charges)
- ✅ Professional lead emails with extracted data
- ✅ Embeddable widget for your Duda site
- ✅ Deploy in 15 minutes

---

## Part 1: Vercel Setup (5 minutes)

### Step 1: Prepare Your Code for Vercel

1. **Create a folder** on your computer called `smart-energy-lead-agent`
2. **Put these files in it:**
   - `server.js`
   - `package.json`
   - `.env.example`
   - `vercel.json` (I'll give you this below)

3. **Create `vercel.json`** in the same folder with this content:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Step 2: Connect to Vercel

1. Go to **https://vercel.com** and sign up (free)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. You'll need to push your code to GitHub first:
   - Create a GitHub account if you don't have one
   - Go to **https://github.com/new** and create a repo called `smart-energy-lead-agent`
   - Follow GitHub's instructions to push your folder to that repo
5. Back in Vercel, select that repository
6. Click **"Deploy"**

### Step 3: Set Environment Variables in Vercel

Before deployment, you need to add your API keys:

1. After clicking Deploy, go to **Settings → Environment Variables**
2. Add these variables (get these below):

```
GMAIL_USER = tom@smart-energy.uk
GMAIL_PASSWORD = [your Gmail app password]
ANTHROPIC_API_KEY = [your Anthropic API key]
CORS_ORIGIN = https://your-duda-site.com
```

---

## Part 2: Get Your API Keys (5 minutes)

### Gmail Setup (for sending lead emails)

1. Go to **https://myaccount.google.com/apppasswords**
2. If you don't see "App passwords", first enable 2FA:
   - Go to **https://myaccount.google.com/security**
   - Click **"2-Step Verification"** and follow prompts
3. Back at App passwords, select:
   - **App:** Mail
   - **Device:** Windows Computer (or Mac)
4. Google generates a 16-character password
5. **Copy this and paste it into Vercel as `GMAIL_PASSWORD`**

### Anthropic API Key

1. Go to **https://console.anthropic.com**
2. Click **"API Keys"** in the sidebar
3. Click **"Create Key"**
4. Copy the key
5. **Paste it into Vercel as `ANTHROPIC_API_KEY`**

---

## Part 3: Embed on Your Duda Site (5 minutes)

Once your Vercel deployment is live, you'll get a URL like:
```
https://your-project-name.vercel.app
```

### To embed the widget on your Duda site:

1. **In your Duda site editor**, add a **Custom Code** element where you want the form
2. **Paste this code:**

```html
<div id="lead-agent-root" style="min-height: 600px; padding: 20px;"></div>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<script type="module">
  import LeadAgent from 'https://your-project-name.vercel.app/LeadAgent.jsx';
  import React from 'https://esm.sh/react';
  import ReactDOM from 'https://esm.sh/react-dom';

  const root = ReactDOM.createRoot(document.getElementById('lead-agent-root'));
  root.render(React.createElement(LeadAgent, {
    apiUrl: 'https://your-project-name.vercel.app'
  }));
</script>
```

**Replace `your-project-name` with your actual Vercel project name**

---

## Part 4: Test It!

1. Go to your Duda page with the embedded form
2. Fill it out and upload a bill
3. Submit
4. **You should receive an email at tom@smart-energy.uk with:**
   - All the lead data
   - The bill file attached
   - Automatically extracted meter data, rates, standing charges, etc.

---

## What Happens After Submission

### Lead Receives:
- Confirmation email confirming their quote request
- Assurance their data is secure

### You Receive:
- Email with full lead details
- Bill file attached
- AI-extracted data (to save you manual entry)
- Lead ID for tracking

---

## Important Notes

### Temporary File Storage
Right now, uploaded files are stored temporarily on Vercel. After ~24 hours, they're automatically cleaned up.

**To upgrade to permanent cloud storage (AWS S3), let me know and I'll:**
1. Update the backend to use AWS S3
2. Show you how to set it up (free tier available)
3. Files will be stored permanently in your S3 bucket

### Email Sending
Using Gmail's app password is the simplest setup. If you want to use a custom email service (SendGrid, Mailgun, etc.), let me know.

### File Uploads
Currently accepts: PDF, JPG, PNG (max 10MB per file)

---

## Troubleshooting

### "CORS Error" when submitting?
The API URL doesn't match your Duda site. Update `CORS_ORIGIN` in Vercel environment variables to your exact Duda URL.

### "Email not sending"?
1. Check your Gmail app password is correct
2. Verify 2FA is enabled on your Gmail account
3. Check Vercel logs: **Settings → Functions**

### "File didn't upload"?
1. Check file size (under 10MB)
2. Check file type (PDF, JPG, PNG only)
3. Check browser console for errors (F12)

### "Bill data not extracting"?
This is optional—the form works fine without it. But if you want to troubleshoot:
1. Try a clearer bill image
2. Check that the bill shows meter numbers, rates clearly

---

## File Organization

```
smart-energy-lead-agent/
├── server.js                 (Backend API)
├── package.json              (Dependencies)
├── .env.example              (Template - copy to .env)
├── vercel.json               (Deployment config)
├── LeadAgent.jsx             (React component)
├── LeadAgent.css             (Styling)
└── README.md                 (This file)
```

---

## Next Steps

1. ✅ Get the files above
2. ✅ Set up GitHub & Vercel
3. ✅ Add environment variables
4. ✅ Deploy
5. ✅ Embed on Duda
6. ✅ Test with a bill
7. ✅ Receive your first qualified lead!

---

## Support

Need help? Issues with:
- **Vercel deployment**: Check their docs at https://vercel.com/docs
- **API keys**: Verify you copied them correctly
- **Gmail setup**: https://support.google.com/accounts/answer/185833
- **Anthropic API**: https://docs.anthropic.com

---

**You've got this! 🚀**
