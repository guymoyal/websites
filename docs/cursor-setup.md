# Cursor IDE Setup Guide

Complete guide for setting up and using this AI Buzz World project in Cursor IDE.

## 🚀 Getting Started with Cursor

### 1. Download and Install Cursor
- Visit [cursor.sh](https://cursor.sh)
- Download Cursor for your operating system
- Install and launch Cursor

### 2. Clone the Project
```bash
git clone <your-repo-url>
cd ai-buzz-tools
```

### 3. Open in Cursor
- Launch Cursor
- File → Open Folder
- Select the `ai-buzz-tools` directory

## ⚙️ Project Setup in Cursor

### 1. Install Dependencies
Open the integrated terminal in Cursor (`Ctrl+`` or `Cmd+``) and run:

```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-your-analytics-id
```

### 3. Generate Content (if needed)
```bash
npm run generate:content
npm run generate:images  # Optional
```

### 4. Start Development Server
```bash
npm run dev
```

## 🛠️ Cursor-Specific Features

### AI-Powered Development
Cursor's AI features work excellently with this TypeScript/React project:

1. **Code Completion**: AI-powered autocomplete for React components
2. **Code Generation**: Generate new components and functions
3. **Bug Fixing**: AI assistance for debugging issues
4. **Refactoring**: Smart code refactoring suggestions

### Recommended Cursor Settings

Add these to your Cursor settings (`Cmd/Ctrl + ,`):

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## 📁 Project Structure Overview

```
ai-buzz-tools/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Homepage
│   ├── tools/             # Tools pages
│   ├── categories/        # Category pages
│   ├── blog/              # Blog articles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── tools/             # Tool components
│   ├── search/            # Search components
│   ├── ads/               # Monetization (Ezoic, sponsors, affiliates)
│   └── layout/            # Layout components
├── lib/                   # Utilities and types
│   ├── types.ts           # TypeScript types
│   ├── tools.ts           # Tool utilities
│   └── content.ts         # Content utilities
├── content/               # Generated content
│   ├── tools.json         # AI tools database
│   ├── categories.json    # Categories
│   └── articles.json      # Blog articles
├── scripts/               # Generation scripts
└── public/                # Static assets
```

## 🎯 Development Workflow

### 1. Working with Components
- Use Cursor's AI to generate new components
- Example prompt: "Create a new ToolComparisonCard component"
- Components use CSS Modules for styling

### 2. Adding New Tools
Edit `content/tools.json` or use generation scripts:
```bash
npm run generate:content
```

### 3. Styling with Tailwind
- IntelliSense works automatically
- Use CSS Modules for component-specific styles
- Global styles in `app/globals.css`

### 4. Testing Changes
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint checking
```

## 🔧 Cursor AI Prompts for This Project

### Component Generation
```
Create a new React component for displaying AI tool statistics with TypeScript and CSS Modules
```

### Bug Fixing
```
Fix the TypeScript error in the ToolCard component related to the pricing prop
```

### Feature Addition
```
Add a favorites feature to the tool cards with local storage persistence
```

### Styling Help
```
Update the card hover effects to be more subtle and professional
```

## 📊 Key Files to Know

### Core Components
- `components/tools/ToolCard.tsx` - Individual tool cards
- `components/search/SearchBar.tsx` - Search functionality
- `components/ads/MonetizationSidebar.tsx`, `ResidualDisplayAd.tsx`, `MonetizationLeaderboard.tsx` - Optional display ads (Ezoic) + sponsor/affiliate blocks

### Pages
- `app/page.tsx` - Homepage
- `app/tools/page.tsx` - Tools directory
- `app/tools/[slug]/page.tsx` - Individual tool pages

### Data & Types
- `lib/types.ts` - TypeScript interfaces
- `content/tools.json` - Tools database
- `content/categories.json` - Categories data

### Styling
- `app/globals.css` - Global styles
- `*.module.css` - Component styles
- `tailwind.config.ts` - Tailwind configuration

## 🚀 Deployment from Cursor

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Push to GitHub from Cursor
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `out`

### Deploy to Vercel
1. Push to GitHub from Cursor
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

## 🎨 Customization Tips

### Branding
1. Update `content/config.json` for site settings
2. Replace logo in `public/images/`
3. Modify colors in `app/globals.css`

### Adding New Pages
1. Create new file in `app/` directory
2. Use existing pages as templates
3. Update navigation in `components/layout/Header.tsx`

### Styling Changes
- Use Cursor AI to help with CSS modifications
- Test responsive design with browser dev tools
- Follow existing CSS Module patterns

## 🔍 Debugging in Cursor

### Common Issues
1. **TypeScript Errors**: Use Cursor's AI to explain and fix
2. **Build Errors**: Check the terminal output in Cursor
3. **Styling Issues**: Use browser dev tools alongside Cursor

### Useful Commands
```bash
npm run dev          # Start development
npm run build        # Test production build
npm run lint         # Check for errors
npm run type-check   # TypeScript checking
```

## 📚 Learning Resources

### Next.js 14
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

## 🤖 AI-Powered Development Tips

### Use Cursor AI for:
1. **Code Generation**: Generate new components and functions
2. **Debugging**: Explain and fix errors
3. **Refactoring**: Improve code structure
4. **Documentation**: Generate comments and docs
5. **Testing**: Create test cases

### Example AI Prompts:
- "Explain this React component and suggest improvements"
- "Create a responsive navigation component"
- "Fix the TypeScript errors in this file"
- "Add error handling to this API call"
- "Generate a loading state for this component"

## 🎯 Next Steps

1. **Explore the Codebase**: Use Cursor's file explorer and AI to understand the structure
2. **Make Changes**: Start with small modifications to get familiar
3. **Test Everything**: Use the development server to test changes
4. **Deploy**: Push to GitHub and deploy to your preferred platform

## 📞 Support

If you encounter issues:
1. Use Cursor's AI chat to ask questions about the code
2. Check the documentation in `/docs`
3. Review the troubleshooting section in README.md

---

**Happy coding with Cursor!** 🚀

This project is optimized for AI-assisted development, making it perfect for Cursor IDE's powerful features.