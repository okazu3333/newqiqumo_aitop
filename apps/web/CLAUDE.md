# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Manager
This project uses **Bun** as the package manager.

```bash
# Install dependencies
bun install

# Development server (with Turbopack)
bun dev

# Build for production (with Turbopack)
bun build

# Start production server
bun start

# Type checking
bun type-check

# Linting and formatting (Biome)
bun lint     # Check and auto-fix issues
bun format   # Format code

# Storybook
# Note: Storybook has compatibility issues with Bun, use npx directly:
npx storybook dev -p 6006    # Development server
npx storybook build          # Build for production
```

### Git Hooks
Husky is configured with pre-commit hooks. Run `bun prepare` after cloning to set up hooks.

### Worktree Management
Clean up merged feature branches and their worktrees:

```bash
# List all worktrees
git worktree list

# Remove worktree (if exists in .git/worktrees/)
git worktree remove <branch-name>

# Delete local branch
git branch -D <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

## Architecture Overview

### Next.js App Router Structure
- **Root redirect**: `/` redirects to `/surveys`
- **Main page**: `/surveys` - Contains the survey dashboard with news and projects sections
- **Layout**: Global layout includes footer component at bottom of all pages
- **Components**: Two component directories:
  - `app/_components/` - App-specific components (footer, header)
  - `components/` - Reusable components including shadcn/ui components

### Authentication
- **Basic Authentication**: Implemented via middleware for all routes
- **Environment Variables**: `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD`
- **Auth endpoint**: `/api/auth` returns 401 with WWW-Authenticate header
- **Middleware**: Excludes API auth route, static files, and favicon

### UI Framework
- **shadcn/ui**: Configured with New York style, TypeScript, and Tailwind CSS
- **Base color**: Neutral with CSS variables enabled
- **Icons**: Lucide React
- **Form handling**: react-hook-form
- **Styling**: Tailwind CSS with custom brand colors (e.g., `#138FB5` for footer)

### Code Quality
- **Linter/Formatter**: Biome with custom configuration
- **Code style**: 
  - 2-space indentation
  - Double quotes for strings
  - Trailing commas enabled
  - 80-character line width
  - Default exports allowed (Next.js convention)

### Component Patterns
- Use named exports for reusable components
- Components in `app/_components/` are app-specific
- Components in `components/` are shared/reusable
- Footer component uses exact brand color `#138FB5`
- Layout uses flexbox for sticky footer positioning
- **Function Declaration Style**: Use `const` with arrow functions instead of `function` declarations for components
- **Type Definitions**: Use `type` instead of `interface` for TypeScript type definitions

### Path Aliases
- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/hooks` → `./hooks`
- `@/components/ui` → `./components/ui`

## Environment Setup
Required environment variables:

### Authentication
- `BASIC_AUTH_USER` - Basic認証のユーザー名
- `BASIC_AUTH_PASSWORD` - Basic認証のパスワード

### Google Sheets Integration
- `NEXT_PUBLIC_LOGIC_CHECK_SPREADSHEET_ID` - ロジックチェック画面で表示するGoogle SpreadsheetsのID（オプション）
  - 例: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit` のSPREADSHEET_ID部分
  - 未設定の場合、デフォルトID: `1NKw4kNF8T0Nd4Js3Ju6oUqrqOOReG9n9Nh0fdC4Wch4`