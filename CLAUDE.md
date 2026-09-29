# Claude Code Configuration

This file contains project-specific information and commands for Claude Code to better assist with this codebase.

## Project Overview
- **Name**: Askstar
- **Type**: Web Application
- **Framework**: React with TypeScript
- **Deployment**: Vercel static portfolio demo

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

## Project Structure
- `src/` - Source code
- `public/` - Static assets
- `dist/` - Build output
- `.firebase/` - Firebase configuration

## Notes
- Main branch: `main`
- Vercel routes configured in `vercel.json`; normal builds use archived local data
- Legacy Firebase files are retained for reference, not used by the portfolio app
- Articles data stored in `public/data/articles.json`