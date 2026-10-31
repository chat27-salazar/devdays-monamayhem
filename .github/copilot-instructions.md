# Project Instructions

## Project overview

Mona Mayhem is a retro arcade GitHub Contribution Battle Arena. The goal is to let users compare GitHub contribution activity in an engaging arcade-style experience.

## Stack and project structure

- Use Astro for the application, with JavaScript or TypeScript as appropriate.
- Use Tailwind CSS or Astro component-scoped CSS for styling; follow the conventions already present in the area being changed.
- Astro pages and API routes live under `src/pages/`. Follow Astro's file-based routing conventions.
- The project uses Astro's strict TypeScript configuration and the Node standalone adapter.
- Keep components and features modular. Follow existing file naming conventions and avoid introducing unnecessary abstractions.

## Implementation guidelines

- Prefer clean, readable, maintainable code over clever or overly generic solutions.
- Preserve existing behavior unless a task explicitly calls for changing it.
- Keep changes focused, and use appropriate types and input validation for API routes.
- Do not assume a dependency is installed; check `package.json` before relying on it.
- Do not edit workshop materials unless the task specifically asks for changes to them.

## Design guide

- Keep the Mona Mayhem interface rooted in a dark 1980s arcade cabinet aesthetic with subtle CRT scanlines and vignette.
- Use Press Start 2P for arcade headings and scores; use JetBrains Mono for body copy, inputs, and stats.
- Use neon cyan/green accents for Player 1 and magenta/gold for Player 2, with restrained text and heatmap glows.
- Keep animation short and atmospheric, respect reduced-motion preferences, and preserve readable contrast.
- New UI should fit the existing neon arcade visual language.

## Development commands

- `npm install` — install dependencies.
- `npm run dev` — start the development server.
- `npm run build` — build the application.
- `npm run preview` — preview the production build.
