## Copyright and Usage

Copyright © 2026 Virti Parekh. All rights reserved.

This repository and its source code are provided for viewing and reference purposes only.

No permission is granted to copy, reproduce, modify, distribute, publish, sell, sublicense, or reuse this source code or any substantial portion of it in another project without prior written permission from the copyright owner.

This project is not released under an open-source license.

# Family Cash Book

A family cash book and expense tracking web application built with React, TypeScript, Vite, and Supabase.

## Features

* Multiple independent cash books
* Cash-in and cash-out transactions
* Transaction categories and payment modes
* Family/member management
* Recurring transactions
* Transaction history and audit information
* Reports and summaries
* Cash book settings and management
* GitHub Pages deployment

## Technology

* React
* TypeScript
* Vite
* Supabase

## Disclaimer

This project is intended for personal and educational use.


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
