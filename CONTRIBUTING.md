# 🤝 Contributing to CineStack

Thank you for your interest in contributing! CineStack is a portfolio project
that aims to showcase collaborative development. All contributions are welcome!

## Code of Conduct

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### 1. Find or Create an Issue
Check [existing issues](https://github.com/mifdlaldev/cinestack/issues)
or create a new one describing what you want to work on.

### 2. Fork & Branch

```bash
git checkout -b feat/your-feature-name
```

### 3. Make Changes

- Follow TypeScript strict mode — no `any` types
- Use Server Components first, Client Components only when needed
- Keep components focused and reusable
- Add tests for new functionality

### 4. Commit with Conventional Commits

```bash
git commit -m "feat: add your feature description"
git commit -m "fix: resolve issue with X"
```

### 5. Push & PR

```bash
git push origin feat/your-feature-name
```

Then open a Pull Request to the `main` branch.

## Development Guidelines

| Area | Guideline |
|------|-----------|
| **TypeScript** | Strict mode, no `any`, no `@ts-ignore` |
| **Components** | Server first, extract logic to `lib/` |
| **State** | React Query for server state, Zustand for UI |
| **Database** | Parameterized queries via Supabase SDK |
| **Security** | Environment variables for all sensitive data |
| **Testing** | Write tests for new features |

## CI/CD

All PRs must pass:
1. ESLint (0 errors)
2. TypeScript type check (0 errors)
3. Next.js build (0 errors)
4. Vitest tests (all passing)

## Questions?

Open a [Discussion](https://github.com/mifdlaldev/cinestack/discussions)
or email contact@cinestack.web.id.
