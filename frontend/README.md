# React + Vite

## Design contract tests

`pnpm test` builds the SPA and runs `tests/` in a real Chrome: `playwright.config.js`
uses `channel: 'chrome'`, so the suite reuses the installed browser instead of
downloading one. The six probes in `tests/design-contract.spec.js` measure the
compiled CSS and the painted behaviour on Login and Mi perfil, and each one fails
if its regression returns: P1 the field height (36 px, so `min-height` binds on
the base-4 scale), P2 the painted accent focus ring, P3 typed-text contrast (the
text token at 4.5:1 or better on the field), P4 that typing in a field clears
that field's error — danger border, `aria-invalid`, `aria-describedby` and the
message — while the other field keeps all four and the form-level node stays,
P5 that the reveal label swaps Mostrar/Ocultar with `aria-label` following it and
`aria-pressed` kept, on all three password fields, and P6 that the field's
reserved right padding clears the control's width in both label states. They
need no backend: `/api/me/` is stubbed per test.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
