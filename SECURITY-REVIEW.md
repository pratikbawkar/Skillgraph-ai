# Security review

Review date: 2026-10-07

## Scope and results

- `docs/architecture/deployment-workflow-v2.json` is static architecture/workflow data. No vulnerability was identified in that file, and no in-repository frontend consumer was found.
- The frontend dependency audit initially reported 11 vulnerable dependency entries across four advisories. Compatible updates resolved the `sharp` and `source-map-js` advisories, and a targeted parser override resolved the PostCSS selector-parser advisory.
- The `braces` stack-exhaustion advisory (GHSA-vfj7-8cjw-p6xm) was removed by migrating Tailwind to v4 and removing the vulnerable Next ESLint shared-config dependency tree. The replacement ESLint setup retains ESLint's recommended and TypeScript recommended rules without the affected globbing dependency chain.
- Final `npm audit` reports zero vulnerabilities.

## Dependency changes

- `tailwindcss` and `@tailwindcss/postcss`: upgraded to 4.3.3. The legacy Tailwind config was replaced with CSS-first theme tokens and a class-based dark variant; a base border color preserves Tailwind 3's default border appearance.
- `eslint-config-next`: removed because its transitive dependency tree included the vulnerable `braces` package. ESLint now runs directly on application and test source using ESLint and TypeScript recommended rules.
- `autoprefixer`: removed; Tailwind 4 handles prefixing in its PostCSS integration.
- `sharp`: updated from 0.35.4 to 0.35.5, resolving GHSA-wq5f-xc86-pv6w.
- `source-map-js`: updated from 1.2.1 to 1.2.2, resolving GHSA-68fv-2mgg-jv7q.
- `postcss-selector-parser`: overridden to `^7.1.6`, resolving GHSA-rj75-hqrm-r3gf.
- No component or page markup was changed. The attached workflow JSON was not changed.

## Validation

- `npm test -- --run`: 17 test files passed, 56 tests passed.
- `npm run lint`: passed.
- `npm run type-check`: passed.
- `npm run build`: passed and exported the static frontend.
- `npm audit`: passed with zero vulnerabilities.
