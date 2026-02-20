# plant-tracker-web

A React + TypeScript frontend for the [plant-tracker](https://github.com/jk-me/plant-tracker) Rails backend.

## Tech stack

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure the API URL (copy the example and edit as needed)
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

The app will be available at <http://localhost:5173> and will proxy API requests to the Rails backend (default: `http://localhost:3000`).

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL of the Rails API |
