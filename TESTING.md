# Testing Guide

Comprehensive testing guide for the SMART on FHIR Provider EHR Launch App.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Testing Best Practices](#testing-best-practices)
- [End-to-End Testing](#end-to-end-testing)

## Overview

This project uses:
- **Vitest** for unit and integration testing
- **React Testing Library** for component testing
- **@testing-library/jest-dom** for DOM matchers
- **Coverage reporting** with c8

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:ui
```

This opens the Vitest UI for interactive test running.

### Coverage Report

```bash
npm run test:coverage
```

Coverage thresholds are set at 80% for:
- Lines
- Functions
- Branches
- Statements

### Specific Test Files

```bash
npx vitest run src/lib/__tests__/utils.test.ts
```

## Test Structure

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── utils.test.ts
│   │   ├── fhir-utils.test.ts
│   │   └── pkce.test.ts
│   └── ...
├── stores/
│   ├── __tests__/
│   │   └── token-store.test.ts
│   └── ...
├── components/
│   ├── __tests__/
│   │   └── button.test.tsx
│   └── ...
└── test/
    └── setup.ts
```

## Writing Tests

### Utility Function Tests

Example from `src/lib/__tests__/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils';

describe('formatDate', () => {
  it('should format a date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('2024');
    expect(result).toContain('January');
  });

  it('should handle undefined', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });
});
```

### Component Tests

Example component test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});
```

### Store Tests

Example from `src/stores/__tests__/token-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useTokenStore } from '../token-store';
import type { TokenData } from '@/types';

describe('tokenStore', () => {
  beforeEach(() => {
    useTokenStore.getState().clearToken();
  });

  it('should set token correctly', () => {
    const mockToken: TokenData = {
      access_token: 'test-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    useTokenStore.getState().setToken(mockToken);
    const { token } = useTokenStore.getState();

    expect(token).toBeDefined();
    expect(token?.access_token).toBe('test-token');
  });
});
```

### Async Tests

```typescript
import { describe, it, expect } from 'vitest';
import { generatePKCEChallenge } from '../pkce';

describe('generatePKCEChallenge', () => {
  it('should generate a PKCE challenge', async () => {
    const result = await generatePKCEChallenge();

    expect(result).toHaveProperty('codeVerifier');
    expect(result).toHaveProperty('codeChallenge');
    expect(result.codeVerifier).toBeTruthy();
    expect(result.codeChallenge).toBeTruthy();
  });
});
```

## Testing Best Practices

### 1. Test Structure

Follow the Arrange-Act-Assert pattern:

```typescript
it('should update token correctly', () => {
  // Arrange
  const mockToken: TokenData = {
    access_token: 'test-token',
    token_type: 'Bearer',
    expires_in: 3600,
  };

  // Act
  useTokenStore.getState().setToken(mockToken);
  useTokenStore.getState().updateToken({ patient: 'new-patient' });

  // Assert
  const { token } = useTokenStore.getState();
  expect(token?.patient).toBe('new-patient');
});
```

### 2. Descriptive Test Names

Use descriptive test names that explain what is being tested:

✅ Good:
```typescript
it('should format patient name from given and family names', () => {
  // ...
});
```

❌ Bad:
```typescript
it('works', () => {
  // ...
});
```

### 3. Test One Thing

Each test should verify one specific behavior:

```typescript
// Good - separate tests for different scenarios
it('should handle valid date string', () => {
  expect(formatDate('2024-01-15')).toContain('2024');
});

it('should handle undefined date', () => {
  expect(formatDate(undefined)).toBe('N/A');
});

it('should handle invalid date', () => {
  expect(formatDate('invalid')).toBe('Invalid date');
});
```

### 4. Use Appropriate Matchers

```typescript
// Strings
expect(result).toBe('exact match');
expect(result).toContain('substring');
expect(result).toMatch(/regex/);

// Numbers
expect(count).toBe(5);
expect(count).toBeGreaterThan(0);
expect(count).toBeLessThanOrEqual(10);

// Objects
expect(obj).toEqual({ key: 'value' });
expect(obj).toHaveProperty('key');

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain('item');

// DOM
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
```

### 5. Mock External Dependencies

```typescript
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked' }),
  } as Response)
);

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));
```

### 6. Clean Up After Tests

```typescript
import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  // Setup before each test
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllMocks();
});
```

## End-to-End Testing

### Manual Testing Checklist

#### SMART Launch Flow

1. **Initial Launch**
   - [ ] Navigate to `/auth/smart/login?iss=<FHIR_SERVER>&launch=<LAUNCH_TOKEN>`
   - [ ] Verify redirect to authorization server
   - [ ] Authorize the application
   - [ ] Verify redirect back to app with code
   - [ ] Check token exchange succeeds

2. **Patient Data Display**
   - [ ] Verify patient banner shows correct information
   - [ ] Check all data cards display counts
   - [ ] Verify lab results table populates
   - [ ] Test tab switching between Overview and Data Viewer

3. **Token Management**
   - [ ] Check token expiry countdown
   - [ ] Test refresh token functionality
   - [ ] Verify expired token warning

4. **Theme Toggle**
   - [ ] Switch between light and dark modes
   - [ ] Verify persistence across page reloads

5. **Responsive Design**
   - [ ] Test on mobile viewport (375px)
   - [ ] Test on tablet viewport (768px)
   - [ ] Test on desktop viewport (1920px)

6. **Accessibility**
   - [ ] Navigate using keyboard only
   - [ ] Test with screen reader
   - [ ] Verify color contrast
   - [ ] Check focus indicators

7. **Error Handling**
   - [ ] Test with invalid launch parameters
   - [ ] Test with expired token
   - [ ] Test with network errors
   - [ ] Verify error boundaries work

### Testing with Different EHRs

#### Epic Sandbox

1. Visit [Epic SMART Launcher](https://fhir.epic.com/)
2. Use test credentials
3. Launch with: `http://localhost:3000/auth/smart/login`

#### Cerner Sandbox

1. Visit [Cerner Code Console](https://code-console.cerner.com/)
2. Use sandbox environment
3. Test with registered app

#### SMART App Launcher

1. Visit [SMART App Launcher](https://launch.smarthealthit.org)
2. Select patient and provider
3. Enter launch URL
4. Test full flow

### Performance Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse audit
lhci autorun --collect.url=http://localhost:3000
```

Expected scores:
- Performance: > 90
- Accessibility: 100
- Best Practices: > 90
- SEO: > 90

### Load Testing

Use k6 for load testing:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Troubleshooting Tests

### Common Issues

1. **Tests timing out**
   - Increase timeout in vitest.config.ts
   - Check for unresolved promises

2. **Flaky tests**
   - Add proper waits for async operations
   - Use `waitFor` from Testing Library
   - Avoid using `setTimeout` in tests

3. **Mock not working**
   - Ensure mock is declared before imports
   - Clear mocks between tests
   - Check mock function signatures

4. **Coverage not meeting threshold**
   - Add tests for uncovered lines
   - Check for unreachable code
   - Verify test assertions are meaningful

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [SMART on FHIR Testing](https://build.fhir.org/ig/HL7/smart-app-launch/testing.html)
