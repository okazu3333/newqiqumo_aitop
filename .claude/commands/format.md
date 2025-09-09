# Format, Lint, and Type Check Commands

This document describes the commands to format, lint, and type-check the codebase.

## Prerequisites

Ensure you have Bun installed and all dependencies are installed:
```bash
bun install
```

## Individual Commands

### 1. Format Code
Formats all code files using Biome:
```bash
bun format
```

### 2. Lint Code
Checks and automatically fixes linting issues:
```bash
bun lint
```

### 3. Type Check
Runs TypeScript type checking without emitting files:
```bash
bun type-check
```

## Combined Commands

### Run All Checks (Recommended)
To run format, lint, and type-check in sequence:
```bash
bun format && bun lint && bun type-check
```

### Quick Fix
To format and lint (with auto-fix) in one go:
```bash
bun format && bun lint
```

## What Each Command Does

### `bun format`
- Uses Biome to format all TypeScript, JavaScript, and JSON files
- Applies consistent code style based on `.biome.json` configuration
- Automatically fixes formatting issues like:
  - Indentation (2 spaces)
  - Quote style (double quotes)
  - Trailing commas
  - Line width (80 characters)

### `bun lint`
- Uses Biome to check for code quality issues
- Automatically fixes safe linting issues
- Checks for:
  - Unused variables and imports
  - Accessibility issues (a11y)
  - Security vulnerabilities
  - Code correctness
  - Performance issues

### `bun type-check`
- Uses TypeScript compiler (`tsc --noEmit`)
- Verifies type safety across the entire codebase
- Does not generate any output files
- Reports type errors that need manual fixing

## Common Issues and Solutions

### Lint Warnings
Some warnings (like `noExplicitAny`) may be acceptable in certain cases:
- Dynamic form handling
- Third-party library integrations
- Type assertions for complex scenarios

### Type Errors
If you encounter type errors:
1. Check if types are properly imported
2. Ensure all required properties are provided
3. Use proper type assertions when necessary
4. Consider creating specific types for complex objects

### Format Conflicts
If formatting keeps changing files:
1. Ensure all team members use the same Biome version
2. Check that `.biome.json` is committed to the repository
3. Run `bun format` before committing changes

## Git Hooks

The project uses Husky for pre-commit hooks. These commands will run automatically before each commit to ensure code quality.

## VS Code Integration

For real-time formatting and linting in VS Code:
1. Install the Biome extension
2. Enable format on save in VS Code settings
3. Set Biome as the default formatter for TypeScript/JavaScript files

## CI/CD Integration

These commands should be part of your CI/CD pipeline:
```yaml
- name: Install dependencies
  run: bun install

- name: Format check
  run: bun format --check

- name: Lint
  run: bun lint

- name: Type check
  run: bun type-check
```