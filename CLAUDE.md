# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands are run from the root of the project:

- `npm run dev` - Starts local dev server at `localhost:4321`
- `npm run build` - Build production site to `./dist/`
- `npm run preview` - Preview build locally before deploying
- `npm run astro ...` - Run Astro CLI commands

## Architecture Overview

This is an Astro-based website for "Kita Luftibus" (a childcare center in Winterthur, Switzerland), built with:

- **Astro 5.11.0** - Static site generator with component-based architecture
- **TailwindCSS 4.x** - Utility-first CSS framework with Vite integration
- **TypeScript** - Type-safe JavaScript for configuration and components

### Project Structure

```
src/
├── components/
│   ├── cards/           # Reusable card components (Team, News, Testimonials)
│   ├── common/          # Shared UI components (Button)
│   ├── layout/          # Layout components (Header, Footer, MobileMenu, TopBar)
│   └── sections/home/   # Homepage section components
├── config/
│   └── navigation.ts    # Centralized navigation configuration
├── content/
│   ├── blog/           # Blog posts in Markdown
│   └── config.ts       # Content collection schemas
├── layouts/
│   ├── Layout.astro    # Main layout wrapper
│   └── BlogPost.astro  # Blog post layout
├── pages/
│   ├── blog/           # Dynamic blog routes
│   └── index.astro     # Homepage
├── scripts/            # Client-side TypeScript
└── styles/             # Global CSS
```

### Key Architectural Patterns

**Navigation System**: Centralized in `src/config/navigation.ts` with typed interfaces supporting nested subpages. The `sitemap` object defines all routes, and helper functions (`getMainNavItems`, `getAllNavItems`) provide structured navigation data.

**Content Management**: Uses Astro's Content Collections API with schema validation in `src/content/config.ts`. Blog posts are stored as Markdown files with frontmatter metadata.

**Component Organization**: 
- Layout components handle site structure
- Card components provide reusable content blocks
- Section components compose homepage layout
- Common components provide shared UI elements

**Styling**: TailwindCSS integrated via Vite plugin. Custom fonts (Quicksand, Source Sans 3, Pangolin) loaded from Google Fonts. Font Awesome icons included globally.

**Responsive Design**: Mobile-first approach with dedicated mobile menu component and responsive navigation patterns.

### Development Notes

- Site content is in German (language: "de")
- Uses TypeScript for type safety in configuration files
- Image assets organized by category in `src/assets/images/`
- Client-side scripts handle mobile menu and team slider functionality
- Layout includes floating phone button for contact