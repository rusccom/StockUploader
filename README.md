# Stock Uploader

Automated AI-powered photo generation and upload system for Adobe Stock.

## Overview

Stock Uploader is a full-stack application that automates the process of generating realistic stock photos using AI models (Flux, Imagen4) and uploading them to Adobe Stock with proper metadata.

## Features

- 🎨 **AI Image Generation**: Uses Flux and Imagen4 models for realistic photo generation
- 🔍 **Smart Prompts**: Gemini LLM generates optimized prompts and metadata
- ⬆️ **AI Upscaling**: Enhances images using Flux Vision or SeedVR upscalers
- 📝 **Automatic Metadata**: Embeds IPTC metadata (title, keywords, description) into images
- 📤 **Adobe Stock Integration**: Automated upload to Adobe Stock via SFTP
- 🌐 **Web Interface**: Easy-to-use interface for managing topics
- ⏰ **Scheduled Processing**: Daily automated workflow via GitHub Actions

## Architecture

### Frontend (Cloudflare Pages)
- React + Vite + TailwindCSS
- Cloudflare Functions for API
- Manages topics and settings

### Worker (GitHub Actions)
- TypeScript/Node.js
- Processes topics daily
- Handles AI generation pipeline

### Database
- External MySQL server
- Stores topics and credentials

## Project Structure

```
StockUploader/
├── web/                    # Cloudflare Pages frontend
│   ├── src/               # React application
│   └── functions/         # Cloudflare Functions API
├── worker/                # GitHub Actions worker
│   └── src/              # Processing services
├── database/             # Database schema
└── Instruction/          # API integration guides
```

## Setup

### Prerequisites
- Node.js 18+
- MySQL database
- Cloudflare account
- GitHub account
- API keys:
  - OpenRouter (for Gemini)
  - FAL.ai (for image generation/upscaling)
  - Adobe I/O (for OAuth2 API)
  - Adobe Stock SFTP credentials (for upload)

### Database Setup

1. Create MySQL database
2. Execute schema:
```bash
mysql -u username -p database_name < database/schema.sql
```

### Frontend Setup (Cloudflare Pages)

1. Navigate to web directory:
```bash
cd web
npm install
```

2. Configure environment variables in Cloudflare Pages dashboard:
```
DB_URL=mysql://user:password@host:port/database
```

3. Deploy to Cloudflare Pages (auto-deploy from GitHub)

### Worker Setup (GitHub Actions)

1. Configure GitHub Secrets:
```
DB_URL=mysql://user:password@host:port/database
OPENROUTER_API_KEY=your_openrouter_key
FAL_KEY=your_fal_key
```

2. GitHub Actions will run automatically based on schedule

## Usage

1. **Add Topic**: Go to web interface and add a new topic
   - Enter topic name (e.g., "sunset beach")
   - Set number of images to generate
   - Choose generation model (Flux/Imagen4)
   - Choose upscale model (Flux Vision/SeedVR)

2. **Automatic Processing**: Worker runs daily and:
   - Fetches oldest 'new' topic
   - Generates prompts via Gemini
   - Creates images via AI
   - Upscales images
   - Embeds metadata
   - Uploads to Adobe Stock via SFTP
   - Marks as 'done'

3. **Monitor Status**: Check topic status in web interface

## Development

### Frontend Development
```bash
cd web
npm run dev
```

### Worker Development
```bash
cd worker
npm run build
npm start
```

## Environment Variables

### Web (Cloudflare Pages)
- `DB_URL` - MySQL connection string

### Worker (GitHub Secrets)
- `DB_URL` - MySQL connection string
- `OPENROUTER_API_KEY` - OpenRouter API key for Gemini
- `FAL_KEY` - FAL.ai API key for image generation/upscaling

## Image Requirements (Adobe Stock)

- **Format**: JPEG
- **Resolution**: Minimum 1600×2400 pixels (4 MP)
- **Quality**: High, no compression artifacts
- **Metadata**: IPTC fields (title, keywords, description)

## License

Private project.

## Support

For issues and questions, please contact the repository owner.

