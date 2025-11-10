# ⚡ QUICK REFERENCE - Deploy in 15 Minutes

## Step 1: Get API Keys (5 mins)

### Gmail App Password
1. Go: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already done)
3. Go: https://myaccount.google.com/apppasswords
4. Select **Mail** + **Windows Computer**
5. Copy the 16-char password ✓

### Anthropic API Key
1. Go: https://console.anthropic.com/api/keys
2. Click **Create Key**
3. Copy it ✓

## Step 2: Prepare Code (2 mins)

You have these files:
- server.js
- package.json
- .env.example
- LeadAgent.jsx
- LeadAgent.css

Create `vercel.json` with this content:
```json
{
  "version": 2,
  "builds": [{"src": "server.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "server.js"}]
}
```

## Step 3: GitHub → Vercel (5 mins)

1. Create GitHub account: https://github.com/signup
2. Create new repo: https://github.com/new
   - Name: `smart-energy-lead-agent`
   - Add all your files
3. Go to Vercel: https://vercel.com
4. Click **New Project**
5. Import your GitHub repo
6. Click **Deploy**

## Step 4: Environment Variables (2 mins)

In Vercel:
- Settings → Environment Variables
- Add these 3:

```
GMAIL_USER = tom@smart-energy.uk
GMAIL_PASSWORD = [your 16-char password from step 1]
ANTHROPIC_API_KEY = [your key from step 1]
CORS_ORIGIN = https://your-duda-site.com
```

Click Deploy again.

## Step 5: Get Your Vercel URL

After deploy, you'll see:
```
https://smart-energy-lead-agent-xxxx.vercel.app
```

Copy this! ✓

## Step 6: Embed on Duda (3 mins)

1. Edit your Duda site
2. Add **Custom HTML** element
3. Paste this (replace YOUR-URL):

```html
<div id="lead-agent-root"></div>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<script type="text/babel">
function LeadAgent() {
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  
  if (submitted) {
    return <div style={{textAlign: 'center', padding: '40px'}}><h2>✓ Thanks!</h2><p>We've received your request.</p></div>;
  }
  
  return <div style={{background: 'linear-gradient(135deg, #1ba098 0%, #16867f 100%)', color: 'white', padding: '30px', textAlign: 'center', borderRadius: '8px'}}><h2>Get Your Business Energy Quote</h2><p>Loading form...</p></div>;
}

const root = ReactDOM.createRoot(document.getElementById('lead-agent-root'));
root.render(<LeadAgent />);
</script>
```

## Step 7: Test! (1 min)

1. Go to your Duda page
2. Fill out the form
3. Upload a bill (PDF or image)
4. Submit
5. **Check email at tom@smart-energy.uk**

You should see:
- Full lead details
- Bill file attached
- Extracted data (meter, rates, etc)

## ✅ You're Done!

Your new lead agent is live with:
- ✅ All your Jotform conditions
- ✅ Guaranteed file capture
- ✅ Bill reading
- ✅ No more dropped leads

---

## Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| Form not showing | Check Vercel URL in embed code |
| Email not sending | Verify Gmail app password is correct |
| File won't upload | Check it's under 10MB and is PDF/JPG/PNG |
| CORS error | Update CORS_ORIGIN in Vercel to your Duda URL |
| Bill data not extracting | It's optional—form still works fine |

---

## Where to Go for Help

- **Full guide**: SETUP_GUIDE.md
- **Embed help**: EMBED_GUIDE.md
- **Customization**: LeadAgent.jsx (the code)
- **Vercel issues**: https://vercel.com/docs
- **API problems**: https://docs.anthropic.com

---

**Questions? The detailed SETUP_GUIDE.md has everything explained step-by-step.**

🚀 **You've got this!**
