# Contributing

This guide describes the development workflow for Boxing Timer.

## Code of Conduct

- Be respectful and inclusive
- No discrimination or harassment
- Assume good intent; ask for clarification
- Report violations to maintainers

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/[username]/boxing-timer.git
cd boxing-timer
```

### 2. Create Feature Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/bug-name
```

**Branch Naming**:
- `feature/xyz` — New feature
- `fix/xyz` — Bug fix
- `refactor/xyz` — Code cleanup
- `docs/xyz` — Documentation
- `test/xyz` — Tests only

### 3. Install Dependencies

```bash
npm install
```

### 4. Make Changes

- Write code
- Write tests (test-first for state logic)
- Run linter: `npm run lint:fix`
- Run type-check: `npm run type-check`
- Run tests: `npm run test`

## Code Style

### TypeScript

- **Strict mode**: Always (enforced via tsconfig.json)
- **No `any`**: Use explicit types
- **Functional components**: Prefer hooks over class components
- **Naming**: camelCase for variables/functions, PascalCase for components/types

```typescript
// ✅ Good
const formatTime = (seconds: number): string => {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
};

// ❌ Bad
const formatTime = (seconds: any) => {
  return seconds / 60 + ':' + (seconds % 60);
};
```

### Formatting

- **Prettier** enforces style automatically
- 100-char line width (see .prettierrc)
- 2-space indentation
- Single quotes for strings
- Trailing commas (es5)

```bash
npm run format
```

### Linting

- ESLint checks TypeScript and React best practices
- No unused variables, imports, or functions

```bash
npm run lint:fix
```

## Testing Requirements

### State Logic (Mandatory)

**All changes to `src/state/timerMachine.ts` require unit tests.**

```typescript
// tests/state/timerMachine.test.ts
import { describe, it, expect } from 'vitest';
import { useTimerStore } from '@state/timerMachine';

describe('Timer State Machine', () => {
  it('transitions from idle to work on start', () => {
    const store = useTimerStore.getState();
    store.start();
    expect(useTimerStore.getState().state).toBe('work');
  });
});
```

**Coverage Target**: 90%+

### Components (Recommended)

Test visual behavior and user interactions:

```typescript
import { render } from '@testing-library/react-native';
import { LightBeacon } from '@components/LightBeacon';

describe('LightBeacon', () => {
  it('renders with correct color', () => {
    const { getByTestId } = render(<LightBeacon color="green" isOn={true} />);
    expect(getByTestId('beacon')).toHaveClass('bg-boxing-green');
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode (re-run on save)
npm run test:watch

# Specific file
npm run test -- src/state/timerMachine.test.ts

# Coverage report
npm run test -- --coverage
```

## Commit Messages

Follow **Conventional Commits**:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat` — New feature
- `fix` — Bug fix
- `test` — Test addition/fix
- `refactor` — Code cleanup (no logic change)
- `docs` — Documentation
- `perf` — Performance improvement
- `build` — Build/dependency change
- `ci` — CI/CD change

**Examples**:

```
feat(timer): add pause/resume functionality

- Implement pause action in timerMachine
- Preserve state across pause/resume
- Add unit tests

Fixes #42
```

```
fix(audio): correct cue trigger timing

Previously cues fired at wrong state transition.

Fixes #38
```

## Pull Request Process

### 1. Before Submitting

- [ ] Tests pass: `npm run test`
- [ ] Type-check passes: `npm run type-check`
- [ ] Linter passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Commit message follows Conventional Commits
- [ ] Branch is up-to-date with `main`

### 2. Create PR

- Use PR template (auto-populated)
- Link related issues: `Fixes #123`
- Describe changes in detail
- Screenshots for UI changes

### 3. Review Process

- At least 1 maintainer review required
- CI must pass (tests, lint, type-check)
- Address review comments
- Re-request review after changes

### 4. Merge

- Squash commits (maintainer does this)
- Delete branch after merge

## Development Workflow Example

```bash
# 1. Create feature branch
git checkout -b feature/haptic-feedback

# 2. Make changes
# ... edit src/components/PrimaryButton.tsx ...

# 3. Write tests
# ... add test to tests/components/PrimaryButton.test.tsx ...

# 4. Format & lint
npm run format
npm run lint:fix

# 5. Run tests
npm run test
npm run type-check

# 6. Commit
git add .
git commit -m "feat(button): add haptic feedback on press"

# 7. Push
git push origin feature/haptic-feedback

# 8. Create PR on GitHub
# ... fill PR template, request review ...

# 9. Address review comments (if any)
# ... make changes, commit again ...

# 10. Merge via GitHub (CI must pass)
```

## File Organization

### Adding a New Component

```
src/components/
├── NewComponent.tsx       # Component implementation
├── NewComponent.test.tsx  # Unit tests
└── index.ts               # Export (if needed)
```

### Adding a New Hook/Utility

```
src/state/ or src/utils/
├── newUtility.ts          # Implementation
├── newUtility.test.ts     # Unit tests
└── index.ts               # Export
```

### Adding Documentation

```
docs/
├── NEW-FEATURE.md         # User-facing docs
└── (link in README.md)
```

## Pre-Commit Hooks (Husky)

Git hooks run automatically before commit:

1. **lint-staged**: Runs ESLint + Prettier on changed files
2. Type-check and tests run in CI (not locally)

If a hook fails:
- `npm run lint:fix` to auto-fix
- Manually edit files if needed
- `git add` and commit again

Bypass hooks only in emergencies:
```bash
git commit --no-verify
```

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for major refactors
- Add/update docs in `docs/` folder
- Keep DECISIONS.md current with ADRs

## Performance & Accessibility

- **Performance**: Verify ProgressRing renders at ≤10 Hz
- **Accessibility**: Test with screen reader (VoiceOver/TalkBack)
- **Contrast**: Use WCAG AA contrast checker for colors
- **Bundle Size**: Verify no new large dependencies

## Debugging

### Web (PWA)

```bash
npm run web
# Open DevTools (F12)
# Console, Network, Lighthouse tabs
```

### React DevTools

- Install React DevTools browser extension
- Inspect component tree, hooks, props

### React Native Debugger

```bash
# Download: https://github.com/jhen0409/react-native-debugger
# Integrate with VS Code
```

## Questions?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for design
- Check [DECISIONS.md](./DECISIONS.md) for rationale
- Open an issue for questions
- Comment in PR for specific questions

## License

By contributing, you agree your code is licensed under MIT (same as project).

---

Thank you for contributing to Boxing Timer! 🥊
