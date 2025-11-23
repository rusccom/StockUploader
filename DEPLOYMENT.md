# Stock Uploader - Deployment Guide

This guide will help you deploy the Stock Uploader application.

## Prerequisites

- MySQL database (8.0+)
- Cloudflare account (free tier works)
- GitHub account
- Node.js 18+ (for local development)

## API Keys Required

1. **OpenRouter API Key** - for Gemini LLM
   - Sign up at: https://openrouter.ai/
   - Get API key from dashboard

2. **FAL.ai API Key** - for image generation and upscaling
   - Sign up at: https://fal.ai/
   - Get API key from settings

3. **Adobe I/O Credentials** - for Adobe Stock upload
   - Create project at: https://developer.adobe.com/console
   - Get Client ID and Client Secret

## Step 1: Database Setup

1. Create a MySQL database
2. Execute the schema:
```bash
mysql -u username -p database_name < database/schema.sql
```

3. Note your connection string:
```
mysql://username:password@host:port/database
```

## Step 2: Deploy Frontend (Cloudflare Pages)

### Option A: Connect via Dashboard (Recommended)

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `cd web && npm install && npm run build`
   - **Build output directory**: `web/dist`
   - **Root directory**: `/`

5. Add environment variable:
   - `DB_URL`: your MySQL connection string

6. Deploy!

### Option B: Using Wrangler CLI

```bash
cd web
npm install
npm run build

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler pages deploy dist --project-name=stock-uploader
```

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `DB_URL`: MySQL connection string
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `FAL_KEY`: Your FAL.ai API key

## Step 4: Configure Adobe Stock Settings

1. Visit your deployed Cloudflare Pages site
2. Go to "Adobe Stock Settings" tab
3. Enter your Client ID and Client Secret from Adobe I/O
4. Save

## Step 5: Test the System

1. **Add a topic**: Go to the web interface, add a test topic
   - Topic: "sunset beach"
   - Image count: 2 (for testing)
   - Model: Flux
   - Upscale: Flux Vision

2. **Trigger worker manually**:
   - Go to GitHub → Actions tab
   - Select "Daily Image Generation"
   - Click "Run workflow"
   - Wait for completion

3. **Check results**:
   - Refresh the web interface
   - Topic status should change: new → processing → done
   - Check GitHub Actions artifacts for generated images

## Daily Automation

The GitHub Action is scheduled to run daily at 00:00 UTC. It will:
- Check for topics with status "new"
- Process one topic per run
- Generate images, upscale them, embed metadata
- Submit to Adobe Stock (if configured)
- Mark topic as "done"

## Troubleshooting

### Frontend not connecting to database
- Check Cloudflare Pages environment variable `DB_URL`
- Ensure MySQL allows connections from Cloudflare IPs
- Check MySQL SSL requirements

### Worker fails to start
- Check GitHub Secrets are set correctly
- Review GitHub Actions logs for error messages
- Ensure database is accessible from GitHub Actions runners

### Images not generating
- Verify FAL_KEY is valid
- Check API quotas on FAL.ai dashboard
- Review worker logs for API errors

### Metadata not embedding
- Exiftool is automatically installed in GitHub Actions
- Check file permissions in worker output directory

### Adobe Stock upload fails
- Verify Client ID and Client Secret are correct
- Check Adobe I/O Console for API limits
- Note: Actual upload requires contributor account setup

## Local Development

### Frontend
```bash
cd web
npm install
npm run dev
# Open http://localhost:5173
```

### Worker
```bash
cd worker
npm install
npm run build

# Set environment variables
export DB_URL="mysql://..."
export OPENROUTER_API_KEY="..."
export FAL_KEY="..."

npm start
```

## Cost Estimation

- **Cloudflare Pages**: Free tier (500 builds/month)
- **GitHub Actions**: 2,000 minutes/month free
- **OpenRouter (Gemini)**: ~$0.01 per 20 prompts
- **FAL.ai**: Pay-as-you-go (check current rates)
- **MySQL hosting**: Varies by provider

## Security Notes

- Never commit API keys to the repository
- Use environment variables for all credentials
- Cloudflare Functions run server-side (secure)
- GitHub Secrets are encrypted at rest

## Support

For issues, check:
1. GitHub Actions logs
2. Cloudflare Pages deployment logs
3. Browser console (for frontend issues)

## Next Steps

After successful deployment:
1. Add more topics through the web interface
2. Monitor daily runs in GitHub Actions
3. Check generated images in workflow artifacts
4. Configure additional Adobe Stock settings if needed

