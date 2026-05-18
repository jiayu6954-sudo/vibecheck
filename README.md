# VibeCheck - Security Scanner for AI-Generated Code

A security and code quality scanner specifically designed for AI-generated code.

## Features

- 🔒 Security vulnerability detection
- 🔧 Maintainability issue identification
- ⚡ Performance problem analysis
- 🎯 Plain English explanations
- 💡 Actionable fix suggestions

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Claude API key:

```bash
cp .env.local.example .env.local
```

Get your Claude API key from: https://console.anthropic.com/

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Paste your AI-generated code into the text area
2. Click "Scan Code"
3. Review the security and quality analysis
4. Follow the fix suggestions

Free users get 3 scans per day (stored in localStorage).

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS
- **AI Engine**: Claude Sonnet 4 (Anthropic API)
- **Rate Limiting**: LocalStorage (frontend soft limit)

## Project Structure

```
├── pages/
│   ├── index.js           # Main scanning interface
│   ├── api/
│   │   └── scan.js        # Scanning API endpoint
│   └── _app.js            # App wrapper
├── styles/
│   └── globals.css        # Global styles + Tailwind
├── .env.local.example     # Environment variable template
└── package.json
```

## Next Steps

- [ ] Add Semgrep rule scanning for faster detection
- [ ] Implement user authentication (Supabase)
- [ ] Add Stripe payment integration
- [ ] Deploy to Vercel

## License

MIT
