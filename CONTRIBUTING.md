# Contributing to SMART on FHIR Provider EHR Launch App

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- Git
- A code editor (VS Code recommended)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/smart-fhir-app.git
   cd smart-fhir-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Make Your Changes

- Write clear, concise code
- Follow the existing code style
- Add or update tests as needed
- Update documentation if you change functionality

### 2. Test Your Changes

```bash
# Run tests
npm test

# Check types
npm run type-check

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format
```

### 3. Commit Your Changes

We follow conventional commits:

```bash
git commit -m "feat: add patient demographics display"
git commit -m "fix: correct token refresh logic"
git commit -m "docs: update README with new features"
git commit -m "test: add tests for FHIR utils"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 4. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template
5. Submit the PR

## Coding Standards

### TypeScript

- **Strict typing**: No `any` types allowed
- **Explicit return types**: Add return types to all functions
- **Proper imports**: Use type imports when importing types

```typescript
// Good
import type { TokenData } from '@/types';

function getToken(): TokenData | null {
  return null;
}

// Bad
function getToken() {
  return null;
}
```

### React Components

- **Functional components only**: Use hooks for state management
- **Props interface**: Always define prop types
- **'use client' directive**: Add to client components

```typescript
// Good
'use client';

import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline';
}

export function Button({ children, onClick, variant = 'default' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// Bad
export function Button(props: any) {
  return <button>{props.children}</button>;
}
```

### File Organization

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── patient/     # Feature-specific components
├── hooks/           # Custom hooks
├── lib/             # Utilities and helpers
├── stores/          # Zustand stores
├── types/           # TypeScript types
└── test/            # Test utilities
```

### Naming Conventions

- **Components**: PascalCase (`Button`, `PatientBanner`)
- **Hooks**: camelCase with 'use' prefix (`useToken`, `useFhirQuery`)
- **Utils**: camelCase (`formatDate`, `generatePKCEChallenge`)
- **Types**: PascalCase (`TokenData`, `FhirPatient`)
- **Constants**: UPPER_SNAKE_CASE (`CLIENT_ID`, `BASE_URL`)

### Styling

- Use TailwindCSS utilities only
- No custom CSS files
- Use Shadcn UI components
- Follow responsive-first approach

```typescript
// Good
<div className="flex items-center gap-4 p-4 md:p-6">
  <Button variant="outline">Click me</Button>
</div>

// Bad
<div style={{ display: 'flex', padding: '16px' }}>
  <button className="custom-button">Click me</button>
</div>
```

### Accessibility

- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Use semantic HTML
- Test with screen readers

```typescript
// Good
<button
  aria-label="Close dialog"
  onClick={onClose}
  className="..."
>
  <X className="h-4 w-4" />
</button>

// Bad
<div onClick={onClose}>
  <X />
</div>
```

## Submitting Changes

### Pull Request Process

1. **Update documentation**: If you change functionality
2. **Add tests**: For all new features and bug fixes
3. **Pass all checks**: Ensure tests, linting, and type-checking pass
4. **Update CHANGELOG**: Add your changes to the unreleased section
5. **Request review**: Tag relevant maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

## Reporting Issues

### Bug Reports

Use the bug report template and include:

1. **Description**: Clear description of the bug
2. **Steps to reproduce**: Numbered list of steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: Browser, OS, Node version
6. **Screenshots**: If applicable
7. **Additional context**: Any other relevant information

### Feature Requests

Use the feature request template and include:

1. **Problem**: What problem does this solve?
2. **Solution**: Describe your proposed solution
3. **Alternatives**: Alternative solutions considered
4. **Additional context**: Any other relevant information

## Development Tips

### VS Code Setup

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

Workspace settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Debugging

Use Next.js debugging:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Testing
npm test                # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report

# Code Quality
npm run lint            # Run linter
npm run lint:fix        # Fix linting issues
npm run type-check      # Check TypeScript types
npm run format          # Format code

# Building
npm run build:epic      # Build for Epic
npm run build:cerner    # Build for Cerner
```

## Questions?

- Check existing [issues](https://github.com/your-repo/issues)
- Review [documentation](./README.md)
- Ask in [discussions](https://github.com/your-repo/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
