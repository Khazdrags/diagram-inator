# Diagram-inator

> Lightweight visual editor for infrastructure-style diagrams, built with React and XY Flow.

![Screenshot](./docs/images/example1.png)

---

[![React](https://skillicons.dev/icons?i=react)](https://react.dev)
[![Vite](https://skillicons.dev/icons?i=vite)](https://vitejs.dev)
[![JavaScript](https://skillicons.dev/icons?i=js)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![MUI](https://skillicons.dev/icons?i=mui)](https://mui.com)

![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

Diagram-inator is a small web app focused on creating node-based diagrams with a clean, modern UI.
It includes a dedicated diagram page, reusable node/edge types, and EC2-oriented context/data helpers.

## Quick Start

```bash
npm install
npm run dev
```

The app runs locally at `http://localhost:5173` (default Vite port).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```text
src/
  diagram/   # Diagram editor, node/edge types, canvas
  home/      # Landing/home view
  shared/    # Router, theme, shared components/constants
```

## License

MIT
